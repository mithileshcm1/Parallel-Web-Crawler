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
    def __init__(self, start_url, max_pages=50, max_depth=2, num_workers=4, timeout=10):
        self.start_url = start_url.rstrip("/")
        self.max_pages = max_pages
        self.max_depth = max_depth
        self.num_workers = num_workers
        self.timeout = timeout

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
        self.to_crawl.put((self.start_url, 0))

        threads = []
        pbar = tqdm(total=self.max_pages, desc="Crawling pages", unit="page")

        for _ in range(self.num_workers):
            t = threading.Thread(target=self._worker, args=(pbar,), daemon=True)
            threads.append(t)
            t.start()

        # Main loop: wait until page limit reached
        while True:
            with self.pages_lock:
                if self.pages_crawled >= self.max_pages:
                    self.stop_flag = True
                    break

        # Workers terminate automatically when stop_flag is set
        for _ in range(self.num_workers):
            self.to_crawl.put(None)

        for t in threads:
            t.join()

        pbar.close()

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

            # Skip visited URLs
            with self.visited_lock:
                if url in self.visited:
                    continue
                self.visited.add(url)

            # Stop if limit reached
            with self.pages_lock:
                if self.pages_crawled >= self.max_pages:
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
        if not page_info.html:
            return {"url": page_info.url, "error": True}

        soup = BeautifulSoup(page_info.html, "html.parser")
        text = soup.get_text(" ", strip=True)
        words = text.split()

        return {
            "url": page_info.url,
            "depth": page_info.depth,
            "title": page_info.title,
            "word_count": len(words),
            "images": len(soup.find_all("img")),
            "links": len(soup.find_all("a")),
            "h1_tags": len(soup.find_all("h1")),
            "h2_tags": len(soup.find_all("h2")),
            "status_code": page_info.status_code,
        }

    # ------------------------------------------------------------

    def save_results(self, pages_path, analysis_path):
        # crawl results
        with open(pages_path, "w", encoding="utf-8") as f:
            f.write("URL\tDepth\tStatus\tTitle\n")
            for p in self.results:
                f.write(f"{p.url}\t{p.depth}\t{p.status_code}\t{p.title}\n")

        # analysis
        with open(analysis_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=[
                    "url", "depth", "title", "word_count", "images",
                    "links", "h1_tags", "h2_tags", "status_code", "error"
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

        print("[+] All files saved.")
