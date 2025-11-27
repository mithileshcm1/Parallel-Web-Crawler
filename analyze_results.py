"""
Demo script to analyze crawl results and generate insights.
This shows how to use the enhanced crawler's output for SEO and content analysis.
"""

import csv
import matplotlib.pyplot as plt
from collections import Counter


def load_analysis_results(csv_file="analysis_results.csv"):
    """Load the analysis results CSV."""
    results = []
    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert numeric fields
            for field in ["word_count", "images", "links", "h1_tags", "h2_tags", 
                         "title_length", "meta_desc_length", "seo_score", 
                         "videos", "audio", "response_time", "health_score"]:
                if row.get(field):
                    row[field] = float(row[field])
            # Convert boolean fields
            for field in ["thin_content", "has_h1", "multiple_h1", 
                         "title_too_short", "title_too_long", "missing_meta_desc"]:
                if row.get(field):
                    row[field] = row[field].lower() == "true"
            results.append(row)
    return results


def analyze_content_quality(results):
    """Analyze content quality metrics."""
    print("\n" + "="*70)
    print("CONTENT QUALITY ANALYSIS")
    print("="*70)
    
    total = len(results)
    thin_pages = sum(1 for r in results if r.get("thin_content", False))
    missing_meta = sum(1 for r in results if r.get("missing_meta_desc", False))
    
    print(f"Total pages: {total}")
    print(f"Thin content pages (< 100 words): {thin_pages} ({thin_pages/total*100:.1f}%)")
    print(f"Missing meta descriptions: {missing_meta} ({missing_meta/total*100:.1f}%)")
    
    # Word count distribution
    word_counts = [r.get("word_count", 0) for r in results]
    print(f"\nWord Count Statistics:")
    print(f"  Min: {min(word_counts):.0f}")
    print(f"  Max: {max(word_counts):.0f}")
    print(f"  Average: {sum(word_counts)/len(word_counts):.0f}")
    print(f"  Median: {sorted(word_counts)[len(word_counts)//2]:.0f}")


def analyze_seo_health(results):
    """Analyze SEO health metrics."""
    print("\n" + "="*70)
    print("SEO HEALTH ANALYSIS")
    print("="*70)
    
    total = len(results)
    no_h1 = sum(1 for r in results if not r.get("has_h1", True))
    multiple_h1 = sum(1 for r in results if r.get("multiple_h1", False))
    
    seo_scores = [r.get("seo_score", 0) for r in results]
    avg_seo = sum(seo_scores) / len(seo_scores)
    
    print(f"Pages missing H1: {no_h1} ({no_h1/total*100:.1f}%)")
    print(f"Pages with multiple H1s: {multiple_h1} ({multiple_h1/total*100:.1f}%)")
    print(f"\nSEO Score Statistics:")
    print(f"  Average: {avg_seo:.1f}/100")
    print(f"  Min: {min(seo_scores):.0f}")
    print(f"  Max: {max(seo_scores):.0f}")
    
    # Score distribution
    score_ranges = {
        "Excellent (80-100)": sum(1 for s in seo_scores if s >= 80),
        "Good (60-79)": sum(1 for s in seo_scores if 60 <= s < 80),
        "Fair (40-59)": sum(1 for s in seo_scores if 40 <= s < 60),
        "Poor (0-39)": sum(1 for s in seo_scores if s < 40),
    }
    print(f"\nSEO Score Distribution:")
    for range_name, count in score_ranges.items():
        print(f"  {range_name}: {count} ({count/total*100:.1f}%)")


def analyze_media_usage(results):
    """Analyze media usage patterns."""
    print("\n" + "="*70)
    print("MEDIA ANALYSIS")
    print("="*70)
    
    total_images = sum(r.get("images", 0) for r in results)
    total_videos = sum(r.get("videos", 0) for r in results)
    total_audio = sum(r.get("audio", 0) for r in results)
    
    print(f"Total Images: {total_images:.0f} (avg {total_images/len(results):.1f} per page)")
    print(f"Total Videos: {total_videos:.0f}")
    print(f"Total Audio: {total_audio:.0f}")
    
    # Correlate media with load times
    media_heavy = [r for r in results if r.get("images", 0) + r.get("videos", 0) > 10]
    media_light = [r for r in results if r.get("images", 0) + r.get("videos", 0) <= 10]
    
    if media_heavy and media_light:
        avg_heavy = sum(r.get("response_time", 0) for r in media_heavy) / len(media_heavy)
        avg_light = sum(r.get("response_time", 0) for r in media_light) / len(media_light)
        
        print(f"\nLoad Time Correlation:")
        print(f"  Media-heavy pages (>10 items): {avg_heavy:.2f}s average")
        print(f"  Media-light pages (≤10 items): {avg_light:.2f}s average")
        if avg_heavy > avg_light * 1.2:
            print(f"  ⚠️  Media-heavy pages load {avg_heavy/avg_light:.1f}× slower!")


def analyze_performance(results):
    """Analyze performance metrics."""
    print("\n" + "="*70)
    print("PERFORMANCE ANALYSIS")
    print("="*70)
    
    response_times = [r.get("response_time", 0) for r in results if r.get("response_time", 0) > 0]
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        slow_pages = sum(1 for t in response_times if t > 2)
        
        print(f"Average Response Time: {avg_time:.2f}s")
        print(f"Slow Pages (>2s): {slow_pages} ({slow_pages/len(results)*100:.1f}%)")
        print(f"Fastest Page: {min(response_times):.2f}s")
        print(f"Slowest Page: {max(response_times):.2f}s")


def analyze_health_scores(results):
    """Analyze overall website health scores."""
    print("\n" + "="*70)
    print("OVERALL WEBSITE HEALTH")
    print("="*70)
    
    health_scores = [r.get("health_score", 0) for r in results]
    avg_health = sum(health_scores) / len(health_scores)
    
    print(f"Average Health Score: {avg_health:.1f}/100")
    print(f"Best Score: {max(health_scores):.1f}")
    print(f"Worst Score: {min(health_scores):.1f}")
    
    # Score distribution
    score_ranges = {
        "Excellent (80-100)": sum(1 for s in health_scores if s >= 80),
        "Good (70-79)": sum(1 for s in health_scores if 70 <= s < 80),
        "Fair (60-69)": sum(1 for s in health_scores if 60 <= s < 70),
        "Poor (<60)": sum(1 for s in health_scores if s < 60),
    }
    print(f"\nHealth Score Distribution:")
    for range_name, count in score_ranges.items():
        print(f"  {range_name}: {count} ({count/len(results)*100:.1f}%)")


def plot_visualizations(results):
    """Generate visualizations (requires matplotlib)."""
    try:
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Website Analysis Dashboard', fontsize=16, fontweight='bold')
        
        # 1. SEO Score Distribution
        seo_scores = [r.get("seo_score", 0) for r in results]
        axes[0, 0].hist(seo_scores, bins=10, color='skyblue', edgecolor='black')
        axes[0, 0].set_title('SEO Score Distribution')
        axes[0, 0].set_xlabel('SEO Score')
        axes[0, 0].set_ylabel('Number of Pages')
        axes[0, 0].axvline(sum(seo_scores)/len(seo_scores), color='red', 
                          linestyle='--', label=f'Avg: {sum(seo_scores)/len(seo_scores):.1f}')
        axes[0, 0].legend()
        
        # 2. Word Count Distribution
        word_counts = [r.get("word_count", 0) for r in results]
        axes[0, 1].hist(word_counts, bins=15, color='lightgreen', edgecolor='black')
        axes[0, 1].set_title('Word Count Distribution')
        axes[0, 1].set_xlabel('Word Count')
        axes[0, 1].set_ylabel('Number of Pages')
        axes[0, 1].axvline(100, color='red', linestyle='--', label='Thin Content (<100)')
        axes[0, 1].legend()
        
        # 3. Health Score vs Response Time
        health_scores = [r.get("health_score", 0) for r in results]
        response_times = [r.get("response_time", 0) for r in results]
        axes[1, 0].scatter(response_times, health_scores, alpha=0.6, color='purple')
        axes[1, 0].set_title('Health Score vs Response Time')
        axes[1, 0].set_xlabel('Response Time (s)')
        axes[1, 0].set_ylabel('Health Score')
        
        # 4. Content Quality Issues
        issues = {
            'Thin Content': sum(1 for r in results if r.get("thin_content", False)),
            'No Meta Desc': sum(1 for r in results if r.get("missing_meta_desc", False)),
            'No H1': sum(1 for r in results if not r.get("has_h1", True)),
            'Multiple H1s': sum(1 for r in results if r.get("multiple_h1", False)),
            'Short Title': sum(1 for r in results if r.get("title_too_short", False)),
        }
        axes[1, 1].barh(list(issues.keys()), list(issues.values()), color='coral')
        axes[1, 1].set_title('Content Quality Issues')
        axes[1, 1].set_xlabel('Number of Pages')
        
        plt.tight_layout()
        plt.savefig('analysis_dashboard.png', dpi=150)
        print("\n✓ Visualization saved to analysis_dashboard.png")
        
    except Exception as e:
        print(f"\n⚠️  Could not generate visualizations: {e}")


def main():
    """Run all analyses."""
    print("\n" + "="*70)
    print("COMPREHENSIVE WEBSITE ANALYSIS")
    print("="*70)
    
    results = load_analysis_results()
    
    analyze_content_quality(results)
    analyze_seo_health(results)
    analyze_media_usage(results)
    analyze_performance(results)
    analyze_health_scores(results)
    
    # Generate visualizations
    print("\n" + "="*70)
    print("GENERATING VISUALIZATIONS")
    print("="*70)
    plot_visualizations(results)
    
    print("\n" + "="*70)
    print("✓ Analysis Complete!")
    print("="*70)
    print("\nCheck summary_report.txt for automated recommendations.")


if __name__ == "__main__":
    main()
