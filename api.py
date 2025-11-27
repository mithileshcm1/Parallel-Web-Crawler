"""
Flask API Server for Web Crawler Dashboard
Connects the Python crawler backend with the React frontend.
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import csv
import os
import threading
import time
from crawler import ParallelWebCrawler

app = Flask(__name__)
CORS(app)

# Global state
crawler_state = {
    'crawler': None,
    'is_running': False,
    'pages_crawled': 0,
    'total_pages': 0,
    'status': 'Idle',
    'start_time': None,
    'end_time': None,
    'execution_time': 0,
    'mode': 'parallel'  # 'parallel' or 'sequential'
}

@app.route('/api/crawl', methods=['POST'])
def start_crawl():
    """Start a new crawl with given parameters."""
    global crawler_state
    
    if crawler_state['is_running']:
        return jsonify({'error': 'Crawl already in progress'}), 400
    
    data = request.json
    url = data.get('url')
    threads = data.get('threads', 8)
    max_pages = data.get('max_pages', 50)
    max_depth = data.get('max_depth', 2)
    sequential_mode = data.get('sequential_mode', False)
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Create crawler instance
    crawler = ParallelWebCrawler(
        start_url=url,
        max_pages=max_pages,
        max_depth=max_depth,
        num_workers=threads,
        sequential_mode=sequential_mode
    )
    
    # Reset state for new crawl
    crawler_state['crawler'] = crawler
    crawler_state['is_running'] = True
    crawler_state['total_pages'] = max_pages
    crawler_state['status'] = 'Crawling'
    crawler_state['start_time'] = time.time()
    crawler_state['end_time'] = None
    crawler_state['execution_time'] = 0
    crawler_state['mode'] = 'sequential' if sequential_mode else 'parallel'
    
    # Clear previous metadata file
    try:
        if os.path.exists('crawl_metadata.txt'):
            os.remove('crawl_metadata.txt')
            print("[DEBUG] Removed old crawl_metadata.txt")
    except Exception as e:
        print(f"[DEBUG] Error removing metadata: {e}")
    
    # Start crawl in background thread
    def run_crawl():
        global crawler_state
        try:
            print(f"[DEBUG] Starting crawl with {threads} threads, mode={crawler_state['mode']}")
            
            # RUN THE CRAWLER
            crawler.start()
            
            # Calculate execution time from start_time
            end = time.time()
            execution_time = end - crawler_state['start_time']  # Use the same start_time as elapsed time
            
            print(f"[DEBUG] ✅ CRAWL COMPLETED!")
            print(f"[DEBUG] Execution time: {execution_time:.2f} seconds")
            
            # Update state
            crawler_state['end_time'] = end
            crawler_state['execution_time'] = execution_time
            crawler_state['status'] = 'Complete'
            
            # Save crawler results
            crawler.save_results('crawl_results.txt', 'analysis_results.csv')
            
            # Save metadata
            metadata_content = (
                f"execution_time={execution_time}\n"
                f"mode={crawler_state['mode']}\n"
                f"start_time={crawler_state['start_time']}\n"
                f"end_time={end}\n"
                f"threads={threads}\n"
                f"pages={max_pages}\n"
            )
            
            with open('crawl_metadata.txt', 'w', encoding='utf-8') as f:
                f.write(metadata_content)
            
            print(f"[DEBUG] ✅ Metadata saved: execution_time={execution_time:.2f}s")
                
        except Exception as e:
            print(f"[DEBUG] ❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            
            # Calculate execution time even on error
            end = time.time()
            execution_time = end - crawler_state['start_time']
            
            crawler_state['status'] = f'Error: {str(e)}'
            crawler_state['end_time'] = end
            crawler_state['execution_time'] = execution_time
            
            # Save error metadata
            try:
                with open('crawl_metadata.txt', 'w', encoding='utf-8') as f:
                    f.write(f"execution_time={execution_time}\n")
                    f.write(f"mode={crawler_state['mode']}\n")
                    f.write(f"error={str(e)}\n")
            except:
                pass
        finally:
            crawler_state['is_running'] = False
            print(f"[DEBUG] Crawl finished: execution_time={crawler_state['execution_time']:.2f}s")
    
    thread = threading.Thread(target=run_crawl, daemon=True)
    thread.start()
    
    return jsonify({
        'message': 'Crawl started',
        'status': 'success',
        'mode': crawler_state['mode']
    })

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Get current crawl progress."""
    crawler = crawler_state.get('crawler')
    
    if crawler:
        pages_crawled = crawler.pages_crawled
    else:
        pages_crawled = 0
    
    # Calculate elapsed time
    elapsed_time = 0
    if crawler_state['start_time']:
        if crawler_state['end_time']:
            elapsed_time = crawler_state['end_time'] - crawler_state['start_time']
        else:
            elapsed_time = time.time() - crawler_state['start_time']
    
    # Report execution_time as live elapsed while running
    # so the dashboard sees an updating value without manual refresh.
    execution_time_val = crawler_state.get('execution_time', 0) or 0
    if crawler_state.get('is_running'):
        execution_time_val = elapsed_time
    elif execution_time_val == 0 and crawler_state.get('end_time') and crawler_state.get('start_time'):
        # If not marked but crawl finished, compute from timestamps
        execution_time_val = crawler_state['end_time'] - crawler_state['start_time']
    
    return jsonify({
        'pages_crawled': pages_crawled,
        'total': crawler_state['total_pages'],
        'status': crawler_state['status'],
        'mode': crawler_state['mode'],
        'elapsed_time': round(elapsed_time, 2),
        'execution_time': round(execution_time_val, 2)
    })

@app.route('/api/results', methods=['GET'])
def get_results():
    """Get detailed analysis results from CSV."""
    try:
        results = []
        with open('analysis_results.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert numeric fields
                for field in ['word_count', 'images', 'links', 'h1_tags', 'h2_tags', 
                             'title_length', 'meta_desc_length', 'seo_score', 
                             'videos', 'audio', 'response_time', 'health_score', 'status_code']:
                    if row.get(field):
                        try:
                            row[field] = float(row[field])
                        except:
                            pass
                
                # Convert boolean fields
                for field in ['thin_content', 'has_h1', 'multiple_h1', 
                             'title_too_short', 'title_too_long', 'missing_meta_desc']:
                    if row.get(field):
                        row[field] = row[field].lower() == 'true'
                
                results.append(row)
        
        return jsonify(results)
    except FileNotFoundError:
        return jsonify([])

@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Get summary statistics."""
    print("[DEBUG] /api/summary called")
    
    try:
        results = []
        with open('analysis_results.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert fields
                for field in ['seo_score', 'health_score', 'response_time', 'word_count']:
                    if row.get(field):
                        try:
                            row[field] = float(row[field])
                        except:
                            row[field] = 0
                
                for field in ['thin_content', 'missing_meta_desc']:
                    if row.get(field):
                        row[field] = row[field].lower() == 'true'
                
                results.append(row)
        
        if not results:
            print("[DEBUG] No results found in CSV")
            return jsonify({})
        
        total_pages = len(results)
        
        # Calculate averages
        avg_seo_score = sum(r.get('seo_score', 0) for r in results) / total_pages
        avg_health_score = sum(r.get('health_score', 0) for r in results) / total_pages
        avg_response_time = sum(r.get('response_time', 0) for r in results) / total_pages
        
        # Percentages
        thin_content_count = sum(1 for r in results if r.get('thin_content'))
        thin_content_percent = (thin_content_count / total_pages) * 100
        
        missing_meta_count = sum(1 for r in results if r.get('missing_meta_desc'))
        missing_meta_desc_percent = (missing_meta_count / total_pages) * 100
        
        slow_pages = sum(1 for r in results if r.get('response_time', 0) > 3)
        slow_pages_percent = (slow_pages / total_pages) * 100
        
        # Broken links count
        broken_links_count = 0
        try:
            with open('broken_links.txt', 'r', encoding='utf-8') as f:
                broken_links_count = len([line for line in f if line.strip() and not line.startswith('URL')])
        except:
            pass
        
        # Most linked page
        most_linked_page = ''
        most_linked_count = 0
        try:
            with open('link_frequency.txt', 'r', encoding='utf-8') as f:
                lines = f.readlines()
                if len(lines) > 0:
                    parts = lines[0].strip().split('\t')
                    if len(parts) >= 2:
                        most_linked_page = parts[0]
                        most_linked_count = int(parts[1])
        except:
            pass
        
        # Get execution time and mode - PRIORITY: in-memory state > file
        execution_time = crawler_state.get('execution_time', 0)
        mode = crawler_state.get('mode', 'parallel')
        
        print(f"[DEBUG] In-memory state:")
        print(f"[DEBUG]   execution_time = {execution_time:.2f}s")
        print(f"[DEBUG]   mode = {mode}")
        
        # If running, report live elapsed time; else if 0, try reading from file
        if crawler_state.get('is_running') and crawler_state.get('start_time'):
            try:
                execution_time = time.time() - crawler_state['start_time']
            except Exception:
                pass
        elif execution_time == 0 and os.path.exists('crawl_metadata.txt'):
            print(f"[DEBUG] In-memory is 0, trying file...")
            try:
                with open('crawl_metadata.txt', 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.startswith('execution_time='):
                            execution_time = float(line.split('=')[1].strip())
                            print(f"[DEBUG] File: execution_time={execution_time:.2f}s")
                        elif line.startswith('mode='):
                            mode = line.split('=')[1].strip()
                            print(f"[DEBUG] File: mode={mode}")
            except Exception as e:
                print(f"[DEBUG] Error reading file: {e}")
        
        summary = {
            'total_pages': total_pages,
            'avg_seo_score': round(avg_seo_score, 2),
            'avg_health_score': round(avg_health_score, 2),
            'avg_response_time': round(avg_response_time, 2),
            'thin_content_percent': round(thin_content_percent, 2),
            'missing_meta_desc_percent': round(missing_meta_desc_percent, 2),
            'slow_pages_percent': round(slow_pages_percent, 2),
            'broken_links_count': broken_links_count,
            'most_linked_page': most_linked_page,
            'most_linked_count': most_linked_count,
            'media_heavy_slow': False,
            'media_heavy_multiplier': 1.0,
            'execution_time': round(execution_time, 2),
            'mode': mode
        }
        
        print(f"[DEBUG] 🎯 Returning execution_time={execution_time:.2f}s")
        
        return jsonify(summary)
        
    except FileNotFoundError as e:
        print(f"[DEBUG] ❌ File not found: {e}")
        return jsonify({})
    except Exception as e:
        print(f"[DEBUG] ❌ Error in summary: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({})

@app.route('/api/download', methods=['GET'])
def download_file():
    """Download a result file."""
    filename = request.args.get('file')
    
    allowed_files = [
        'crawl_results.txt',
        'analysis_results.csv',
        'broken_links.txt',
        'link_frequency.txt',
        'summary_report.txt',
        'crawl_metadata.txt'
    ]
    
    if filename not in allowed_files:
        return jsonify({'error': 'Invalid filename'}), 400
    
    if not os.path.exists(filename):
        return jsonify({'error': 'File not found'}), 404
    
    return send_file(filename, as_attachment=True)

if __name__ == '__main__':
    print("="*70)
    print("WEB CRAWLER API SERVER")
    print("="*70)
    print("Backend API: http://localhost:5000")
    print("Frontend should run on: http://localhost:3000")
    print("\nAvailable endpoints:")
    print("  POST   /api/crawl      - Start new crawl")
    print("  GET    /api/progress   - Get crawl progress")
    print("  GET    /api/results    - Get analysis results")
    print("  GET    /api/summary    - Get summary statistics")
    print("  GET    /api/download   - Download result files")
    print("="*70)
    print()
    
    app.run(debug=True, port=5000)
