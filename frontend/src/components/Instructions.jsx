import { FaInfoCircle } from 'react-icons/fa';

const Instructions = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaInfoCircle className="text-blue-600" />
        Understanding Your Results
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SEO Score */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-blue-700 mb-2">📊 SEO Score (0-100)</h4>
          <p className="text-sm text-gray-600 mb-2">
            Measures how well your page follows SEO best practices.
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>90-100:</strong> Excellent - top-tier SEO</li>
            <li>• <strong>70-89:</strong> Good - minor improvements needed</li>
            <li>• <strong>50-69:</strong> Fair - several issues to fix</li>
            <li>• <strong>&lt;50:</strong> Poor - requires significant work</li>
          </ul>
          <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
            <strong>Factors:</strong> H1 tags (25%), title optimization (20%), meta description (20%), content quality (15%), images (10%), H2 tags (10%)
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-purple-700 mb-2">💚 Health Score (0-100)</h4>
          <p className="text-sm text-gray-600 mb-2">
            Overall page quality combining SEO, performance, and content.
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>80-100:</strong> Excellent health</li>
            <li>• <strong>70-79:</strong> Good - minor issues</li>
            <li>• <strong>60-69:</strong> Fair - needs attention</li>
            <li>• <strong>&lt;60:</strong> Poor - multiple problems</li>
          </ul>
          <div className="mt-3 text-xs bg-purple-50 p-2 rounded">
            <strong>Weighted:</strong> SEO (40%), Performance (30%), Content Quality (20%), Availability (10%)
          </div>
        </div>

        {/* Thread Count */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-green-700 mb-2">⚡ Thread Count</h4>
          <p className="text-sm text-gray-600 mb-2">
            Number of parallel workers fetching pages simultaneously.
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>1-4 threads:</strong> Slow but safe</li>
            <li>• <strong>8-16 threads:</strong> Optimal for most sites</li>
            <li>• <strong>32+ threads:</strong> Fast but may hit rate limits</li>
          </ul>
          <div className="mt-3 text-xs bg-green-50 p-2 rounded">
            <strong>Tip:</strong> More threads = faster crawl, but diminishing returns after 16 threads
          </div>
        </div>

        {/* Link Frequency */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-pink-700 mb-2">🔗 Link Frequency</h4>
          <p className="text-sm text-gray-600 mb-2">
            Tracks how many times each URL is linked from other pages.
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>High frequency:</strong> Important pages (e.g., homepage)</li>
            <li>• <strong>Low frequency:</strong> Orphaned or deep pages</li>
            <li>• <strong>Use case:</strong> Find most important pages for optimization</li>
          </ul>
          <div className="mt-3 text-xs bg-pink-50 p-2 rounded">
            <strong>SEO Tip:</strong> Pages with more internal links rank better in search engines
          </div>
        </div>

        {/* Content Metrics */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-yellow-700 mb-2">📝 Content Metrics</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>Thin Content:</strong> Pages with &lt;100 words (bad for SEO)</li>
            <li>• <strong>Title Length:</strong> Optimal 30-60 characters</li>
            <li>• <strong>Meta Description:</strong> Should be 150-160 characters</li>
            <li>• <strong>Word Count:</strong> Minimum 300 words recommended</li>
          </ul>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-bold text-lg text-indigo-700 mb-2">⚡ Performance</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• <strong>&lt;1s:</strong> Excellent load time</li>
            <li>• <strong>1-2s:</strong> Good performance</li>
            <li>• <strong>2-3s:</strong> Acceptable but improvable</li>
            <li>• <strong>&gt;3s:</strong> Slow - needs optimization</li>
          </ul>
          <div className="mt-3 text-xs bg-indigo-50 p-2 rounded">
            <strong>Tip:</strong> Compress images, minify CSS/JS, use CDN
          </div>
        </div>
      </div>

      {/* Architecture Note */}
      <div className="mt-6 bg-white rounded-lg p-4 shadow border-2 border-blue-300">
        <h4 className="font-bold text-lg text-blue-800 mb-2">🏗️ Crawler Architecture</h4>
        <p className="text-sm text-gray-700">
          This crawler uses a <strong>3-stage parallel pipeline</strong>:
        </p>
        <ol className="text-xs text-gray-600 mt-2 space-y-1 ml-4 list-decimal">
          <li><strong>Crawl Workers:</strong> Fetch pages in parallel (n threads)</li>
          <li><strong>Analysis Workers:</strong> Parse HTML and compute all 22+ metrics (n/2 threads)</li>
          <li><strong>Reporter Thread:</strong> Write broken links in real-time (1 thread)</li>
        </ol>
        <p className="text-xs text-gray-600 mt-2">
          All metrics are computed <strong>in a single pass</strong> during analysis, ensuring zero latency overhead.
        </p>
      </div>
    </div>
  );
};

export default Instructions;
