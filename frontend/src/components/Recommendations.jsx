import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const Recommendations = ({ summary, results }) => {
  const recommendations = [];

  // Content Quality Recommendations
  if (summary?.thin_content_percent > 20) {
    recommendations.push({
      type: 'warning',
      icon: <FaExclamationTriangle />,
      message: `${Math.round(summary.thin_content_percent)}% of pages have thin content (<100 words). Consider adding more detailed content.`,
      count: Math.round(summary.total_pages * summary.thin_content_percent / 100)
    });
  }

  if (summary?.missing_meta_desc_percent > 20) {
    recommendations.push({
      type: 'warning',
      icon: <FaExclamationTriangle />,
      message: `${Math.round(summary.missing_meta_desc_percent || 0)}% of pages are missing meta descriptions. This hurts SEO rankings.`,
      count: Math.round(summary.total_pages * (summary.missing_meta_desc_percent || 0) / 100)
    });
  }

  // Performance Recommendations
  if (summary?.slow_pages_percent > 30) {
    recommendations.push({
      type: 'error',
      icon: <FaExclamationTriangle />,
      message: `${Math.round(summary.slow_pages_percent)}% of pages load slowly (>3s). Optimize images and reduce page size.`,
      count: Math.round(summary.total_pages * summary.slow_pages_percent / 100)
    });
  }

  // SEO Recommendations
  if (summary?.avg_seo_score < 70) {
    recommendations.push({
      type: 'error',
      icon: <FaExclamationTriangle />,
      message: `Average SEO score is ${summary.avg_seo_score.toFixed(1)}/100. Focus on improving title tags, meta descriptions, and heading structure.`
    });
  }

  // Broken Links
  if (summary?.broken_links_count > 0) {
    recommendations.push({
      type: 'error',
      icon: <FaExclamationTriangle />,
      message: `${summary.broken_links_count} broken links found. Fix these to improve user experience and SEO.`,
      count: summary.broken_links_count
    });
  }

  // H1 Tags
  const noH1Pages = results?.filter(p => !p.has_h1).length || 0;
  if (noH1Pages > 0) {
    recommendations.push({
      type: 'warning',
      icon: <FaExclamationTriangle />,
      message: `${noH1Pages} pages are missing H1 tags. Each page should have exactly one H1.`,
      count: noH1Pages
    });
  }

  const multipleH1Pages = results?.filter(p => p.multiple_h1).length || 0;
  if (multipleH1Pages > 0) {
    recommendations.push({
      type: 'warning',
      icon: <FaExclamationTriangle />,
      message: `${multipleH1Pages} pages have multiple H1 tags. Use only one H1 per page for better SEO.`,
      count: multipleH1Pages
    });
  }

  // Media Analysis
  if (summary?.media_heavy_slow) {
    recommendations.push({
      type: 'info',
      icon: <FaInfoCircle />,
      message: `Media-heavy pages load ${summary.media_heavy_multiplier?.toFixed(1)}× slower. Consider lazy loading images and compressing media.`
    });
  }

  // Most Linked Page
  if (summary?.most_linked_page) {
    recommendations.push({
      type: 'success',
      icon: <FaCheckCircle />,
      message: `Homepage is the most linked page with ${summary.most_linked_count || 0} internal links. This is good for SEO.`
    });
  }

  // Positive Recommendations
  if (summary?.avg_seo_score >= 80) {
    recommendations.push({
      type: 'success',
      icon: <FaCheckCircle />,
      message: `Excellent SEO! Average score of ${summary.avg_seo_score.toFixed(1)}/100. Keep up the good work.`
    });
  }

  if (summary?.avg_response_time < 2) {
    recommendations.push({
      type: 'success',
      icon: <FaCheckCircle />,
      message: `Great performance! Average response time is ${summary.avg_response_time.toFixed(2)}s.`
    });
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 Automated Recommendations</h3>
      
      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <p className="text-lg">No major issues found! Your website looks great.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`${getTypeColor(rec.type)} border-2 rounded-lg p-4 flex items-start gap-4`}
            >
              <div className={`${getIconColor(rec.type)} text-2xl flex-shrink-0 mt-1`}>
                {rec.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium">{rec.message}</p>
                {rec.count && (
                  <p className="text-sm mt-1 opacity-75">Affects {rec.count} pages</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
