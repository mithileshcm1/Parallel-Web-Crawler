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
- Uses **analysis worker threads** to compute metrics:
  - Word count
  - Number of images (`<img>`)
  - Number of links (`<a>`)
  - Count of `<h1>` and `<h2>` tags
- Uses a dedicated **broken-link reporter thread** to:
  - Continuously write broken links to `broken_links.txt`
  - While crawling is still running
- Tracks **link frequency** (how many times each URL is linked)
- Saves results to:
  - `crawl_results.txt` – basic info per crawled page
  - `link_frequency.txt` – most-linked URLs
  - `analysis_results.csv` – per-page metrics
  - `broken_links.txt` – broken URLs + status

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

  Columns:

  ```
  url, depth, title, word_count, images, links, h1_tags, h2_tags, status_code, error
  ```

- `broken_links.txt`

  ```
  URL	Status	Title
  http://books.toscrape.com/badpage	404	Not Found
  http://books.toscrape.com/oldpage	None	ERROR: ...
  ```

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

6. **Applications**
   - SEO analysis (most-linked pages, heading usage).
   - Broken link detection.
   - Content analysis.

7. **Conclusion & Future Work**
   - Add robots.txt support, politeness rules (crawl delay).
   - Add distributed crawling using multiple machines.
