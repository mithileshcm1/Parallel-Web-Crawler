# Parallel Web Crawler – Advanced Version

This project is a **multi-stage parallel web crawler** in Python.
It demonstrates:

- Thread-based parallel crawling (I/O-bound)
- Parallel data analysis on crawled pages
- Parallel broken-link detection and reporting
- Shared data structures + synchronization
- Performance measurement (threads vs time)

## Features

- Crawls pages from a given **start URL**, limited by:
  - `--max-pages`
  - `--max-depth`
- Restricts to the **same domain** as the start URL.
- Uses a pool of **crawl worker threads** to:
  - Fetch pages
  - Extract links
  - Enqueue pages for analysis
- Uses **analysis worker threads** to compute comprehensive metrics:
  - **Basic counts**: word_count, images, links, h1_tags, h2_tags
  - **Content quality**: thin_content flag, title_length, meta_desc_length
  - **SEO health**: has_h1, multiple_h1, title validation, seo_score (0-100)
  - **Media analysis**: videos, audio elements
  - **Performance**: response_time per page
  - **Overall**: health_score (composite 0-100)
- Uses a dedicated **broken-link reporter thread** to:
  - Continuously write broken links to `broken_links.txt`
  - While crawling is still running
- Tracks **link frequency** (how many times each URL is linked)
- Generates **comprehensive summary report** with insights and recommendations
- Saves results to:
  - `crawl_results.txt` – basic info per crawled page
  - `link_frequency.txt` – most-linked URLs
  - `analysis_results.csv` – detailed per-page metrics (22+ columns)
  - `broken_links.txt` – broken URLs + status
  - `summary_report.txt` – automated analysis and recommendations

## Project Structure

```
parallel_web_crawler_final/
├── main.py              # CLI entry point
├── crawler.py           # Core multi-stage parallel crawler
├── utils.py             # URL utilities
├── requirements.txt     # Dependencies
└── README.md            # Documentation
```

## Installation

```bash
pip install -r requirements.txt
```

## Usage

Basic example:

```bash
python main.py http://books.toscrape.com -n 8 --max-pages 50 --max-depth 2 -o crawl_results.txt --analysis-output analysis_results.csv
```

Parameters:

- `start_url` – starting URL to crawl
- `-n / --threads` – number of crawl worker threads
- `--max-pages` – maximum pages to crawl
- `--max-depth` – link depth to follow
- `-o / --output` – text file with basic crawl info
- `--analysis-output` – CSV with detailed per-page metrics
- `--log-performance` – optional CSV logging of run timings

Example with performance logging:

```bash
python main.py http://books.toscrape.com -n 1 --max-pages 50 --max-depth 2 --log-performance perf.csv
python main.py http://books.toscrape.com -n 4 --max-pages 50 --max-depth 2 --log-performance perf.csv
python main.py http://books.toscrape.com -n 8 --max-pages 50 --max-depth 2 --log-performance perf.csv
```

Then open `perf.csv` and plot **threads vs time_sec** to show the
effect of parallelism.

## Output Files

- `crawl_results.txt`

  ```
  URL	Depth	Status	Title
  http://books.toscrape.com	0	200	All products | Books to Scrape
  ...
  ```

- `link_frequency.txt`

  ```
  URL	Count
  http://books.toscrape.com/	15
  http://books.toscrape.com/catalogue/...	7
  ```

- `analysis_results.csv`

  Columns (22+ fields):

  ```
  url, depth, title, word_count, images, links, h1_tags, h2_tags, status_code,
  thin_content, title_length, meta_desc_length, has_h1, multiple_h1, 
  title_too_short, title_too_long, missing_meta_desc, seo_score, 
  videos, audio, response_time, health_score, error
  ```

- `broken_links.txt`

  ```
  URL	Status	Title
  http://books.toscrape.com/badpage	404	Not Found
  http://books.toscrape.com/oldpage	None	ERROR: ...
  ```

- `summary_report.txt`

  Comprehensive analysis report including:
  - Content quality analysis (thin pages, missing meta descriptions)
  - SEO health analysis (H1 tags, title validation, SEO scores)
  - Media analysis (images, videos, audio usage)
  - Performance analysis (response times, slow pages)
  - Overall website health score
  - Automated recommendations for improvement

## Parallel Programming Concepts

- **Task Parallelism**
  - Multiple crawl workers fetching different pages concurrently.
  - Analyzer threads working on already-fetched pages.

- **Pipeline Parallelism**
  - Stage 1: Crawl workers push PageInfo objects into `to_analyze` queue.
  - Stage 2: Analysis workers consume from `to_analyze`, produce metrics or broken-link reports.
  - Stage 3: Broken reporter thread writes broken link records while earlier stages still run.

- **Shared Data & Synchronization**
  - `visited` set (protected by a `Lock`)
  - `results` list (per-page basic info)
  - `link_frequency` dict (updated in parallel)
  - `analysis_results` list
  - `broken_links` list
  - Each shared structure guarded by `threading.Lock()` to prevent race conditions.

- **Queues for Thread-Safe Communication**
  - `to_crawl` – URLs to be fetched.
  - `to_analyze` – PageInfo objects to analyze.
  - `to_report_broken` – broken page records to be written.

## Suggested Report Sections

1. **Introduction**
   - What is web crawling?
   - Why use parallelism for crawling? (network latency, many independent pages)

2. **System Design**
   - Diagram showing 3 stages: crawl → analyze → report.
   - Description of queues and worker types.

3. **Implementation Details**
   - Thread model (number of workers, locks).
   - Data structures used.
   - Explanation of metrics collected.

4. **Experiments**
   - Compare runs with different thread counts (`n=1, 2, 4, 8, 16`).
   - Measure total time and pages crawled.
   - Plot graphs from `perf.csv`.

5. **Results & Discussion**
   - Show where speedup is good and where it flattens.
   - Discuss overhead of too many threads.

6. **Advanced Analysis Insights**
   
   a. **Content Quality Analysis**
   - Identify thin pages (word_count < 100)
   - Pages with too short/long titles
   - Missing H1 tags or meta descriptions
   - Example conclusion: "40% of pages have less than 100 words — thin content, bad for SEO."
   
   b. **SEO Health Analysis**
   - Pages with no H1 tag or multiple H1 tags (bad SEO)
   - Title length validation
   - SEO score distribution (0-100)
   - Example conclusion: "The average SEO score is 62/100 — fair but needs improvement."
   
   c. **Media Analysis**
   - Count media usage per page (images, videos, audio)
   - Correlate media-heavy pages with load times
   - Example conclusion: "Media-heavy pages load 2× slower."
   
   d. **Website Health Score (Composite)**
   - Combines: response_time, seo_score, broken links, content quality
   - Overall site health score (0-100)
   - Example conclusion: "Overall site health score: 71/100 — good but with improvement areas."

7. **Applications**
   - SEO analysis (most-linked pages, heading usage, content quality).
   - Broken link detection.
   - Content quality auditing.
   - Performance monitoring.
   - Website health assessment.

8. **Conclusion & Future Work**
   - Add robots.txt support, politeness rules (crawl delay).
   - Add distributed crawling using multiple machines.
   - Implement machine learning for content quality prediction.
   - Add more detailed accessibility analysis.
