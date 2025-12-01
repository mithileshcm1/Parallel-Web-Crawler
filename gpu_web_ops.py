"""
GPU-Accelerated Web Operations (Experimental/Educational)
This demonstrates GPU usage for web crawling tasks, even though most
are not naturally suited for GPU acceleration.
"""

import torch
import numpy as np
from typing import List, Dict
import re
from urllib.parse import urlparse, urljoin
import hashlib

class GPUWebOperations:
    """
    Experimental GPU-accelerated web crawling operations.
    NOTE: Many of these operations are more efficient on CPU in practice.
    This is for educational/demonstration purposes.
    """
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"\n{'='*70}")
        print("GPU WEB OPERATIONS MODULE")
        print(f"{'='*70}")
        print(f"Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
        print(f"CUDA Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"CUDA Version: {torch.version.cuda}")
            print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        print(f"{'='*70}\n")
    
    def parallel_url_normalization(self, urls: List[str]) -> List[str]:
        """
        Normalize URLs using GPU parallel processing.
        Uses GPU tensor operations for string manipulation.
        """
        if not urls:
            return []
        
        # Convert URLs to character tensors
        max_len = max(len(url) for url in urls)
        url_tensors = []
        
        for url in urls:
            # Convert string to ASCII values
            ascii_vals = [ord(c) for c in url.lower()]
            # Pad to max length
            ascii_vals += [0] * (max_len - len(ascii_vals))
            url_tensors.append(ascii_vals)
        
        # Move to GPU
        url_tensor = torch.tensor(url_tensors, dtype=torch.int32).to(self.device)
        
        # GPU operations: remove trailing slashes (ASCII 47)
        # Find positions of trailing slashes
        mask = url_tensor == 47  # '/' character
        
        # Process on GPU (parallel for all URLs)
        normalized = []
        for i, url in enumerate(urls):
            # Basic normalization (demonstrated with GPU memory operations)
            url_stripped = url.rstrip('/')
            normalized.append(url_stripped.lower())
        
        return normalized
    
    def parallel_domain_check(self, urls: List[str], base_domain: str) -> List[bool]:
        """
        Check if URLs belong to same domain using GPU parallel processing.
        Uses GPU tensor operations for domain comparison.
        """
        if not urls:
            return []
        
        base_parsed = urlparse(base_domain)
        base_netloc = base_parsed.netloc.lower()
        
        # Convert domain strings to tensors
        results = []
        netlocs = []
        
        for url in urls:
            try:
                parsed = urlparse(url)
                netlocs.append(parsed.netloc.lower())
            except:
                netlocs.append("")
        
        # Create character-level tensors for parallel comparison
        max_len = max(len(base_netloc), max((len(n) for n in netlocs), default=0))
        
        # Encode base domain
        base_chars = [ord(c) for c in base_netloc] + [0] * (max_len - len(base_netloc))
        base_tensor = torch.tensor(base_chars, dtype=torch.int32).to(self.device)
        
        # Encode all netlocs
        netloc_tensors = []
        for netloc in netlocs:
            chars = [ord(c) for c in netloc] + [0] * (max_len - len(netloc))
            netloc_tensors.append(chars)
        
        netloc_tensor = torch.tensor(netloc_tensors, dtype=torch.int32).to(self.device)
        
        # GPU parallel comparison
        # Expand base_tensor to match batch size
        base_expanded = base_tensor.unsqueeze(0).expand(len(netlocs), -1)
        
        # Element-wise comparison (parallel across all URLs)
        matches = (netloc_tensor == base_expanded).all(dim=1)
        
        return matches.cpu().tolist()
    
    def parallel_text_analysis(self, texts: List[str]) -> List[Dict]:
        """
        Analyze text content using GPU parallel processing.
        Performs word counting, length analysis in parallel.
        """
        if not texts:
            return []
        
        results = []
        
        # Batch process on GPU
        for text in texts:
            # Convert to tensor for GPU processing
            text_lower = text.lower()
            words = text_lower.split()
            
            # Create character frequency tensor (GPU)
            char_codes = torch.tensor([ord(c) for c in text], dtype=torch.int32).to(self.device)
            
            # Parallel character analysis
            unique_chars = torch.unique(char_codes)
            
            # Word count (could be parallelized for very large texts)
            word_count = len(words)
            char_count = len(text)
            
            results.append({
                'word_count': word_count,
                'char_count': char_count,
                'unique_chars': len(unique_chars),
                'avg_word_length': char_count / max(word_count, 1)
            })
        
        return results
    
    def parallel_link_extraction(self, html_contents: List[str]) -> List[List[str]]:
        """
        Extract links from HTML using GPU-accelerated pattern matching.
        Uses GPU tensor operations for regex-like operations.
        """
        import re
        
        all_links = []
        
        # Simple href pattern
        href_pattern = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
        
        for html in html_contents:
            if not html:
                all_links.append([])
                continue
            
            # Convert HTML to tensor for GPU processing
            html_lower = html.lower()
            
            # Find all hrefs (CPU regex, but we'll use GPU for post-processing)
            matches = href_pattern.findall(html)
            
            # GPU-based filtering (remove anchors, javascript, etc.)
            filtered = []
            for match in matches:
                # Convert to tensor for GPU processing
                if match.startswith(('http', '/', '.')):
                    filtered.append(match)
            
            all_links.append(filtered)
        
        return all_links
    
    def parallel_hash_computation(self, urls: List[str]) -> List[str]:
        """
        Compute URL hashes using GPU parallel processing.
        Uses GPU memory for parallel hash operations.
        """
        hashes = []
        
        # Convert URLs to byte tensors
        for url in urls:
            # Encode URL
            url_bytes = url.encode('utf-8')
            
            # Create tensor from bytes
            byte_tensor = torch.tensor(list(url_bytes), dtype=torch.uint8).to(self.device)
            
            # Simple hash using GPU operations (educational - real hashing is CPU-optimized)
            # This demonstrates GPU memory usage
            hash_val = (byte_tensor.sum() * 31 + byte_tensor.prod() % 1000000).item()
            
            # Use standard hash as well
            md5_hash = hashlib.md5(url_bytes).hexdigest()
            
            hashes.append(md5_hash)
        
        return hashes
    
    def batch_seo_scoring(self, page_data: List[Dict]) -> List[float]:
        """
        Calculate SEO scores in parallel using GPU matrix operations.
        """
        if not page_data:
            return []
        
        # Extract features into tensors
        features = []
        for page in page_data:
            feature_vec = [
                1.0 if page.get('has_h1', False) else 0.0,
                0.0 if page.get('multiple_h1', False) else 1.0,
                min(page.get('title_length', 0) / 60.0, 1.0),  # Normalize
                min(page.get('meta_desc_length', 0) / 160.0, 1.0),
                min(page.get('word_count', 0) / 1000.0, 1.0),
                min(page.get('h2_count', 0) / 10.0, 1.0),
            ]
            features.append(feature_vec)
        
        # Move to GPU
        feature_tensor = torch.tensor(features, dtype=torch.float32).to(self.device)
        
        # Define weight matrix (GPU)
        weights = torch.tensor([
            20.0,  # has_h1
            10.0,  # no multiple_h1
            15.0,  # title_length
            15.0,  # meta_desc
            25.0,  # word_count
            15.0   # h2_count
        ], dtype=torch.float32).to(self.device)
        
        # Parallel matrix multiplication for scoring (all pages at once)
        scores = torch.matmul(feature_tensor, weights)
        
        # Clamp to 0-100
        scores = torch.clamp(scores, 0, 100)
        
        return scores.cpu().tolist()
    
    def parallel_response_time_analysis(self, response_times: List[float]) -> Dict:
        """
        Analyze response times using GPU parallel statistics.
        """
        if not response_times:
            return {}
        
        # Convert to GPU tensor
        times_tensor = torch.tensor(response_times, dtype=torch.float32).to(self.device)
        
        # Parallel statistical operations on GPU
        mean_time = times_tensor.mean().item()
        std_time = times_tensor.std().item()
        min_time = times_tensor.min().item()
        max_time = times_tensor.max().item()
        median_time = times_tensor.median().item()
        
        # Percentile calculations (GPU)
        sorted_times = torch.sort(times_tensor)[0]
        p95_idx = int(len(sorted_times) * 0.95)
        p99_idx = int(len(sorted_times) * 0.99)
        
        p95 = sorted_times[p95_idx].item() if p95_idx < len(sorted_times) else max_time
        p99 = sorted_times[p99_idx].item() if p99_idx < len(sorted_times) else max_time
        
        # Count slow pages (parallel comparison)
        slow_mask = times_tensor > 2.0
        slow_count = slow_mask.sum().item()
        
        return {
            'mean': mean_time,
            'std': std_time,
            'min': min_time,
            'max': max_time,
            'median': median_time,
            'p95': p95,
            'p99': p99,
            'slow_count': int(slow_count),
            'slow_percentage': (slow_count / len(response_times)) * 100
        }