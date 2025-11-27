import threading
from queue import Queue, Empty
from dataclasses import dataclass
from typing import Optional, Dict, List, Tuple
import csv

import requests
from bs4 import BeautifulSoup
from tqdm import tqdm

from utils import normalize_url, same_domain


@dataclass
class PageInfo:
    url: str
    depth: int
    status_code: Optional[int] = None
    title: Optional[str] = None
    html: Optional[str] = None
    elapsed: Optional[float] = None


class ParallelWebCrawler:
    def __init__(self, start_url, max_pages=50, max_depth=2, num_workers=4, timeout=10, sequential_mode=False):
        self.start_url = start_url.rstrip("/")
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.num_workers = num_workers
        self.timeout = timeout
        self.sequential_mode = sequential_mode  # New: Run in sequential mode for comparison

        self.session = requests.Session()

        # Work queue
        self.to_crawl = Queue()

        # Shared state
        self.visited = set()
        self.visited_lock = threading.Lock()

        self.pages_crawled = 0
        self.pages_lock = threading.Lock()

        self.results: List[PageInfo] = []
        self.results_lock = threading.Lock()

        self.analysis_results: List[Dict[str, object]] = []
        self.analysis_lock = threading.Lock()

        self.link_frequency: Dict[str, int] = {}
        self.link_freq_lock = threading.Lock()

        self.broken_links: List[Tuple[str, Optional[int], str]] = []
        self.broken_lock = threading.Lock()

        self.stop_flag = False

    # ------------------------------------------------------------

    def start(self):
        """Start crawling in either parallel or sequential mode."""
        if self.sequential_mode:
            self._start_sequential()
        else:
            self._start_parallel()

    # ------------------------------------------------------------

    def _start_parallel(self):
        """Original parallel crawling implementation with early termination."""
        self.to_crawl.put((self.start_url, 0))
        
        # Track active workers
        self.active_workers = 0
        self.active_workers_lock = threading.Lock()
        
        # Track consecutive empty queue checks
        self.empty_queue_count = 0
        self.empty_queue_lock = threading.Lock()

        threads = []
        pbar = tqdm(total=self.max_pages, desc="Crawling pages (PARALLEL)", unit="page")

        for _ in range(self.num_workers):
            t = threading.Thread(target=self._worker, args=(pbar,), daemon=True)
            threads.append(t)
            t.start()

        # Main loop: wait until page limit reached OR no more work available
        while True:
            with self.pages_lock:
                if self.pages_crawled >= self.max_pages:
                    self.stop_flag = True
                    break
            
            # Check if queue is empty and all workers are idle
            queue_empty = self.to_crawl.empty()
            with self.active_workers_lock:
                all_idle = self.active_workers == 0
            
            if queue_empty and all_idle:
                with self.empty_queue_lock:
                    self.empty_queue_count += 1
                    # If queue empty for 3 consecutive checks (3 seconds), stop
                    if self.empty_queue_count >= 3:
                        print(f"\n[!] No more pages to crawl. Stopping early at {self.pages_crawled} pages.")
                        self.stop_flag = True
                        break
            else:
                with self.empty_queue_lock:
                    self.empty_queue_count = 0
            
            # Small sleep to avoid busy-waiting
            threading.Event().wait(1)

        # Workers terminate automatically when stop_flag is set
        for _ in range(self.num_workers):
            self.to_crawl.put(None)

        for t in threads:
            t.join()

        pbar.close()

    # ------------------------------------------------------------

    def _start_sequential(self):
        """Sequential crawling with single thread for performance comparison."""
        pbar = tqdm(total=self.max_pages, desc="Crawling pages (SEQUENTIAL)", unit="page")
        
        # Initialize with start URL
        to_process = [(self.start_url, 0)]
        
        while to_process and self.pages_crawled < self.max_pages:
            url, depth = to_process.pop(0)
            
            # Skip visited URLs
            if url in self.visited:
                continue
            self.visited.add(url)
            
            # Stop if limit reached
            if self.pages_crawled >= self.max_pages:
                break
            self.pages_crawled += 1
            
            # Fetch page
            info = self._fetch_page(url, depth)
            self.results.append(info)
            
            # Broken?
            if info.status_code is None or info.status_code >= 400:
                self.broken_links.append(
                    (info.url, info.status_code, info.title or "")
                )
            else:
                # Analyze page
                metrics = self._analyze_page(info)
                self.analysis_results.append(metrics)
                
                # Enqueue new links
                if depth < self.max_depth and info.html:
                    new_links = self._extract_links(info, depth)
                    to_process.extend(new_links)
            
            pbar.update(1)
        
        pbar.close()

    # ------------------------------------------------------------

    def _extract_links(self, info: PageInfo, depth: int) -> List[Tuple[str, int]]:
        """Extract and return links from a page (helper for sequential mode)."""
        new_links = []
        try:
            soup = BeautifulSoup(info.html, "html.parser")
            for link in soup.find_all("a", href=True):
                href = link["href"]
                full = normalize_url(info.url, href)  # Fixed: correct parameter order
                if full and same_domain(full, self.start_url):
                    # Only add if not already visited
                    if full not in self.visited:
                        new_links.append((full, depth + 1))
                    
                    # Track link frequency
                    self.link_frequency[full] = self.link_frequency.get(full, 0) + 1
        except Exception:
            pass
        
        return new_links

    # ------------------------------------------------------------

    def _worker(self, pbar):
        while True:
            try:
                item = self.to_crawl.get(timeout=1)
            except Empty:
                if self.stop_flag:
                    return
                continue

            if item is None:
                return

            url, depth = item
            
            # Mark worker as active AFTER getting work
            with self.active_workers_lock:
                self.active_workers += 1

            # Skip visited URLs
            with self.visited_lock:
                if url in self.visited:
                    with self.active_workers_lock:
                        self.active_workers -= 1
                    continue
                self.visited.add(url)

            # Stop if limit reached
            with self.pages_lock:
                if self.pages_crawled >= self.max_pages:
                    with self.active_workers_lock:
                        self.active_workers -= 1
                    return
                self.pages_crawled += 1

            # Fetch page
            info = self._fetch_page(url, depth)

            with self.results_lock:
                self.results.append(info)

            # Broken?
            if info.status_code is None or info.status_code >= 400:
                with self.broken_lock:
                    self.broken_links.append(
                        (info.url, info.status_code, info.title or "")
                    )
            else:
                metrics = self._analyze_page(info)
                with self.analysis_lock:
                    self.analysis_results.append(metrics)

                # Enqueue new links
                if depth < self.max_depth and info.html:
                    self._enqueue_links(info, depth)

            pbar.update(1)

            # Mark worker as idle after completing work
            with self.active_workers_lock:
                self.active_workers -= 1

    # ------------------------------------------------------------

    def _fetch_page(self, url, depth):
        try:
            r = self.session.get(url, timeout=self.timeout)
            status = r.status_code

            html = None
            title = None
            if status == 200 and "text/html" in r.headers.get("Content-Type", ""):
                html = r.text
                soup = BeautifulSoup(html, "html.parser")
                t = soup.find("title")
                title = t.string.strip() if t and t.string else None

            return PageInfo(
                url=url,
                depth=depth,
                status_code=status,
                title=title,
                html=html,
                elapsed=r.elapsed.total_seconds() if r.elapsed else None,
            )
        except Exception as e:
            return PageInfo(
                url=url,
                depth=depth,
                status_code=None,
                title=f"ERROR: {e}",
                html=None,
            )

    # ------------------------------------------------------------

    def _enqueue_links(self, page_info, depth):
        try:
            soup = BeautifulSoup(page_info.html, "html.parser")
            for a in soup.find_all("a", href=True):
                new = normalize_url(page_info.url, a["href"])
                if new and same_domain(new, self.start_url):
                    with self.visited_lock:
                        if new not in self.visited:
                            self.to_crawl.put((new, depth + 1))
                            with self.link_freq_lock:
                                self.link_frequency[new] = \
                                    self.link_frequency.get(new, 0) + 1
        except:
            pass

    # ------------------------------------------------------------

    def _analyze_page(self, page_info):
        """Compute comprehensive metrics including SEO and content quality."""
        if not page_info.html:
            return {"url": page_info.url, "error": True}

        soup = BeautifulSoup(page_info.html, "html.parser")
        text = soup.get_text(" ", strip=True)
        words = text.split()
        word_count = len(words)
        
        # Basic counts
        num_images = len(soup.find_all("img"))
        num_links = len(soup.find_all("a"))
        h1_count = len(soup.find_all("h1"))
        h2_count = len(soup.find_all("h2"))
        
        # Media analysis
        num_videos = len(soup.find_all("video"))
        num_audio = len(soup.find_all("audio"))
        
        # Content quality metrics
        thin_content = word_count < 100
        title_length = len(page_info.title or "")
        
        # Meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_desc_length = len(meta_desc.get("content", "")) if meta_desc else 0
        
        # SEO metrics
        has_h1 = h1_count > 0
        multiple_h1 = h1_count > 1
        title_too_short = title_length < 30
        title_too_long = title_length > 60
        missing_meta_desc = meta_desc_length == 0
        
        # Calculate SEO score (0-100)
        seo_score = self._calculate_seo_score(
            has_h1=has_h1,
            multiple_h1=multiple_h1,
            title_length=title_length,
            meta_desc_length=meta_desc_length,
            word_count=word_count,
            h2_count=h2_count
        )
        
        # Response time from page_info
        response_time = page_info.elapsed if page_info.elapsed else 0
        
        # Website health score (composite)
        health_score = self._calculate_health_score(
            seo_score=seo_score,
            response_time=response_time,
            thin_content=thin_content,
            status_code=page_info.status_code
        )

        return {
            "url": page_info.url,
            "depth": page_info.depth,
            "title": page_info.title,
            "word_count": word_count,
            "images": num_images,
            "links": num_links,
            "h1_tags": h1_count,
            "h2_tags": h2_count,
            "status_code": page_info.status_code,
            # Content quality
            "thin_content": thin_content,
            "title_length": title_length,
            "meta_desc_length": meta_desc_length,
            # SEO health
            "has_h1": has_h1,
            "multiple_h1": multiple_h1,
            "title_too_short": title_too_short,
            "title_too_long": title_too_long,
            "missing_meta_desc": missing_meta_desc,
            "seo_score": seo_score,
            # Media
            "videos": num_videos,
            "audio": num_audio,
            # Performance
            "response_time": response_time,
            # Overall
            "health_score": health_score,
        }

    # ------------------------------------------------------------
    
    def _calculate_seo_score(self, has_h1, multiple_h1, title_length, meta_desc_length, word_count, h2_count):
        """Calculate SEO score (0-100) based on best practices."""
        score = 100
        
        # H1 tag checks
        if not has_h1:
            score -= 20
        if multiple_h1:
            score -= 10
            
        # Title checks
        if title_length < 30:
            score -= 15
        elif title_length > 60:
            score -= 10
            
        # Meta description
        if meta_desc_length == 0:
            score -= 15
        elif meta_desc_length < 50 or meta_desc_length > 160:
            score -= 5
            
        # Content quality
        if word_count < 100:
            score -= 20
        elif word_count < 300:
            score -= 10
            
        # Heading structure
        if h2_count == 0 and word_count > 300:
            score -= 10
            
        return max(0, score)
    
    def _calculate_health_score(self, seo_score, response_time, thin_content, status_code):
        """Calculate overall website health score (0-100)."""
        score = 100
        
        # SEO component (40% weight)
        score = seo_score * 0.4
        
        # Performance component (30% weight)
        perf_score = 100
        if response_time > 3:
            perf_score = 40
        elif response_time > 2:
            perf_score = 60
        elif response_time > 1:
            perf_score = 80
        score += perf_score * 0.3
        
        # Content component (20% weight)
        content_score = 0 if thin_content else 100
        score += content_score * 0.2
        
        # Availability component (10% weight)
        avail_score = 100 if status_code == 200 else 0
        score += avail_score * 0.1
        
        return round(score, 1)

    # ------------------------------------------------------------

    def save_results(self, pages_path, analysis_path):
        # crawl results
        with open(pages_path, "w", encoding="utf-8") as f:
            f.write("URL\tDepth\tStatus\tTitle\n")
            for p in self.results:
                f.write(f"{p.url}\t{p.depth}\t{p.status_code}\t{p.title}\n")

        # analysis with all new fields
        with open(analysis_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "url", "depth", "title", "word_count", "images",
                    "links", "h1_tags", "h2_tags", "status_code",
                    "thin_content", "title_length", "meta_desc_length",
                    "has_h1", "multiple_h1", "title_too_short", "title_too_long",
                    "missing_meta_desc", "seo_score", "videos", "audio",
                    "response_time", "health_score", "error"
                ]
            )
            writer.writeheader()
            for r in self.analysis_results:
                writer.writerow(r)

        # link frequency
        with open("link_frequency.txt", "w", encoding="utf-8") as f:
            for link, count in sorted(self.link_frequency.items(), key=lambda x: x[1], reverse=True):
                f.write(f"{link}\t{count}\n")

        # broken links
        with open("broken_links.txt", "w", encoding="utf-8") as f:
            for url, status, title in self.broken_links:
                f.write(f"{url}\t{status}\t{title}\n")
        
        # Generate summary report
        self._generate_summary_report()

        print("[+] All files saved.")
    
    def _generate_summary_report(self):
        """Generate a comprehensive summary report with insights."""
        if not self.analysis_results:
            return
        
        total_pages = len(self.analysis_results)
        
        # Content Quality Analysis
        thin_pages = sum(1 for r in self.analysis_results if r.get("thin_content", False))
        missing_meta = sum(1 for r in self.analysis_results if r.get("missing_meta_desc", False))
        short_titles = sum(1 for r in self.analysis_results if r.get("title_too_short", False))
        long_titles = sum(1 for r in self.analysis_results if r.get("title_too_long", False))
        
        # SEO Health Analysis
        no_h1 = sum(1 for r in self.analysis_results if not r.get("has_h1", True))
        multiple_h1s = sum(1 for r in self.analysis_results if r.get("multiple_h1", False))
        avg_seo_score = sum(r.get("seo_score", 0) for r in self.analysis_results) / total_pages
        
        # Media Analysis
        total_images = sum(r.get("images", 0) for r in self.analysis_results)
        total_videos = sum(r.get("videos", 0) for r in self.analysis_results)
        total_audio = sum(r.get("audio", 0) for r in self.analysis_results)
        avg_images = total_images / total_pages
        
        # Performance Analysis
        response_times = [r.get("response_time", 0) for r in self.analysis_results if r.get("response_time", 0) > 0]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        slow_pages = sum(1 for t in response_times if t > 2)
        
        # Overall Health
        avg_health_score = sum(r.get("health_score", 0) for r in self.analysis_results) / total_pages
        
        # Write summary report
        with open("summary_report.txt", "w", encoding="utf-8") as f:
            f.write("=" * 70 + "\n")
            f.write("WEBSITE ANALYSIS SUMMARY REPORT\n")
            f.write("=" * 70 + "\n\n")
            
            f.write(f"Total Pages Analyzed: {total_pages}\n")
            f.write(f"Broken Links Found: {len(self.broken_links)}\n\n")
            
            f.write("-" * 70 + "\n")
            f.write("1. CONTENT QUALITY ANALYSIS\n")
            f.write("-" * 70 + "\n")
            f.write(f"Thin Content Pages (< 100 words): {thin_pages} ({thin_pages/total_pages*100:.1f}%)\n")
            f.write(f"Missing Meta Descriptions: {missing_meta} ({missing_meta/total_pages*100:.1f}%)\n")
            f.write(f"Titles Too Short (< 30 chars): {short_titles} ({short_titles/total_pages*100:.1f}%)\n")
            f.write(f"Titles Too Long (> 60 chars): {long_titles} ({long_titles/total_pages*100:.1f}%)\n")
            
            if thin_pages / total_pages > 0.3:
                f.write(f"\n⚠️  WARNING: {thin_pages/total_pages*100:.0f}% of pages have thin content - bad for SEO!\n")
            if missing_meta / total_pages > 0.2:
                f.write(f"⚠️  WARNING: {missing_meta/total_pages*100:.0f}% of pages are missing meta descriptions.\n")
            
            f.write("\n" + "-" * 70 + "\n")
            f.write("2. SEO HEALTH ANALYSIS\n")
            f.write("-" * 70 + "\n")
            f.write(f"Pages Missing H1 Tag: {no_h1} ({no_h1/total_pages*100:.1f}%)\n")
            f.write(f"Pages with Multiple H1 Tags: {multiple_h1s} ({multiple_h1s/total_pages*100:.1f}%)\n")
            f.write(f"Average SEO Score: {avg_seo_score:.1f}/100\n")
            
            if avg_seo_score >= 80:
                f.write("\n✓ Excellent SEO structure overall!\n")
            elif avg_seo_score >= 60:
                f.write(f"\n⚠️  Average SEO score is {avg_seo_score:.0f}/100 - fair but needs improvement.\n")
            else:
                f.write(f"\n❌ Poor SEO score ({avg_seo_score:.0f}/100) - requires significant work.\n")
            
            if no_h1 > 0:
                f.write(f"⚠️  {no_h1/total_pages*100:.0f}% of pages are missing H1 tags.\n")
            if multiple_h1s > 0:
                f.write(f"⚠️  {multiple_h1s} pages have multiple H1 tags (bad SEO practice).\n")
            
            f.write("\n" + "-" * 70 + "\n")
            f.write("3. MEDIA ANALYSIS\n")
            f.write("-" * 70 + "\n")
            f.write(f"Total Images: {total_images} (avg {avg_images:.1f} per page)\n")
            f.write(f"Total Videos: {total_videos}\n")
            f.write(f"Total Audio Files: {total_audio}\n")
            
            if total_videos == 0:
                f.write("\n📝 Note: The site uses very few videos - mostly static images.\n")
            
            # Correlate media with load times
            if response_times:
                media_heavy_pages = [r for r in self.analysis_results 
                                    if r.get("images", 0) + r.get("videos", 0) > 10]
                if media_heavy_pages:
                    media_heavy_times = [r.get("response_time", 0) for r in media_heavy_pages 
                                        if r.get("response_time", 0) > 0]
                    if media_heavy_times:
                        avg_media_heavy = sum(media_heavy_times) / len(media_heavy_times)
                        if avg_media_heavy > avg_response_time * 1.5:
                            f.write(f"⚠️  Media-heavy pages load {avg_media_heavy/avg_response_time:.1f}× slower.\n")
            
            f.write("\n" + "-" * 70 + "\n")
            f.write("4. PERFORMANCE ANALYSIS\n")
            f.write("-" * 70 + "\n")
            f.write(f"Average Response Time: {avg_response_time:.2f}s\n")
            f.write(f"Slow Pages (> 2s): {slow_pages} ({slow_pages/total_pages*100:.1f}%)\n")
            
            if avg_response_time > 2:
                f.write("\n⚠️  Average response time is slow - consider optimization.\n")
            elif avg_response_time < 1:
                f.write("\n✓ Excellent response times!\n")
            
            f.write("\n" + "=" * 70 + "\n")
            f.write("5. OVERALL WEBSITE HEALTH SCORE\n")
            f.write("=" * 70 + "\n")
            f.write(f"Health Score: {avg_health_score:.1f}/100\n\n")
            
            if avg_health_score >= 80:
                f.write("✓ EXCELLENT - Website is in great health!\n")
            elif avg_health_score >= 70:
                f.write("✓ GOOD - Overall site health is good with minor improvement areas.\n")
            elif avg_health_score >= 60:
                f.write("⚠️  FAIR - Website needs attention in several areas.\n")
            else:
                f.write("❌ POOR - Significant improvements needed across multiple areas.\n")
            
            f.write("\n" + "=" * 70 + "\n")
            f.write("RECOMMENDATIONS\n")
            f.write("=" * 70 + "\n")
            
            recommendations = []
            if thin_pages / total_pages > 0.2:
                recommendations.append(f"• Add more content to {thin_pages} thin pages (< 100 words)")
            if missing_meta / total_pages > 0.2:
                recommendations.append(f"• Add meta descriptions to {missing_meta} pages")
            if no_h1 > 0:
                recommendations.append(f"• Add H1 tags to {no_h1} pages")
            if multiple_h1s > 0:
                recommendations.append(f"• Fix {multiple_h1s} pages with multiple H1 tags")
            if slow_pages > total_pages * 0.2:
                recommendations.append(f"• Optimize {slow_pages} slow-loading pages")
            if avg_seo_score < 70:
                recommendations.append("• Improve overall SEO structure and content quality")
            
            if recommendations:
                for rec in recommendations:
                    f.write(f"{rec}\n")
            else:
                f.write("✓ No critical issues found. Continue monitoring and maintaining quality.\n")
            
            f.write("\n" + "=" * 70 + "\n")
        
        print("[+] Summary report saved to summary_report.txt")
