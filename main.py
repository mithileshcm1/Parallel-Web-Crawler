import argparse
import time
import csv
import os

from crawler import ParallelWebCrawler


def parse_args():
    parser = argparse.ArgumentParser(
        description="Parallel Web Crawler with analysis & broken-link reporting",
        epilog="Example: python main.py http://books.toscrape.com -n 8 --max-pages 50 --max-depth 2 -o results.txt",
    )
    parser.add_argument("start_url", help="Starting URL (root) to crawl")
    parser.add_argument(
        "-n", "--threads", type=int, default=4,
        help="Number of worker threads (default: 4)",
    )
    parser.add_argument(
        "--max-pages", type=int, default=50,
        help="Maximum number of pages to crawl (default: 50)",
    )
    parser.add_argument(
        "--max-depth", type=int, default=2,
        help="Maximum depth to follow links (default: 2)",
    )
    parser.add_argument(
        "-o", "--output", default="crawl_results.txt",
        help="Output file for page list (default: crawl_results.txt)",
    )
    parser.add_argument(
        "--analysis-output", default="analysis_results.csv",
        help="CSV file for per-page analysis metrics (default: analysis_results.csv)",
    )
    parser.add_argument(
        "--log-performance", default=None,
        help="Optional CSV file to append (threads, max_pages, max_depth, time_sec, actual_pages)",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    print("Start URL :", args.start_url)
    print("Threads   :", args.threads)
    print("Max pages :", args.max_pages)
    print("Max depth :", args.max_depth)
    print("Output    :", args.output)
    print("Analysis  :", args.analysis_output)
    print("-------------------------------------------\n")


    crawler = ParallelWebCrawler(
        start_url=args.start_url,
        max_pages=args.max_pages,
        max_depth=args.max_depth,
        num_workers=args.threads,
    )

    t0 = time.perf_counter()
    crawler.start()
    t1 = time.perf_counter()

    elapsed = t1 - t0
    print(f"\n[+] Crawl completed in {elapsed:.2f} seconds with {args.threads} threads.")
    print(f"[+] Total pages crawled: {crawler.pages_crawled}\n")


    crawler.save_results(args.output, args.analysis_output)

    # optional performance logging
    if args.log_performance:
        file_exists = os.path.exists(args.log_performance)
        with open(args.log_performance, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["threads", "max_pages", "max_depth", "time_sec", "actual_pages"])
            writer.writerow([
                args.threads,
                args.max_pages,
                args.max_depth,
                f"{elapsed:.4f}",
                crawler.pages_crawled,
            ])
        print(f"[+] Appended performance data to {args.log_performance}")


if __name__ == "__main__":
    main()
