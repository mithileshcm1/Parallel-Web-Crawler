import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startCrawl, getProgress } from '../api/crawlerApi';
import { Oval } from 'react-loader-spinner';
import { FaSpider, FaRocket } from 'react-icons/fa';

const CrawlInputPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: 'https://quotes.toscrape.com',
    threads: 8,
    max_pages: 50,
    max_depth: 2,
    sequential_mode: false  // New: toggle for sequential mode
  });
  const [isCrawling, setIsCrawling] = useState(false);
  const [progress, setProgress] = useState({ 
    pages_crawled: 0, 
    total: 0, 
    status: '', 
    mode: 'parallel',
    elapsed_time: 0,
    execution_time: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (isCrawling) {
      interval = setInterval(async () => {
        try {
          const progressData = await getProgress();
          setProgress(progressData);
          
          if (progressData.pages_crawled >= progressData.total || progressData.status === 'Complete') {
            clearInterval(interval);
            setTimeout(() => navigate('/dashboard'), 1000);
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCrawling, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'url' ? value : parseInt(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.url.startsWith('http')) {
      setError('URL must start with http:// or https://');
      return;
    }

    try {
      setIsCrawling(true);
      await startCrawl(formData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start crawl');
      setIsCrawling(false);
    }
  };

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.pages_crawled / progress.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaSpider className="text-5xl text-indigo-600 animate-pulse" />
            <h1 className="text-5xl font-bold text-gray-800">Web Crawler</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Multi-threaded parallel crawling with advanced SEO & performance analysis
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!isCrawling ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Starting URL
                </label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  placeholder="https://example.com"
                  required
                />
              </div>

              {/* Threads Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Threads: <span className="text-indigo-600 font-bold">{formData.threads}</span>
                  {formData.sequential_mode && <span className="text-orange-600 ml-2">(Disabled in Sequential Mode)</span>}
                </label>
                <input
                  type="range"
                  name="threads"
                  min="1"
                  max="32"
                  value={formData.threads}
                  onChange={handleInputChange}
                  disabled={formData.sequential_mode}
                  className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 ${formData.sequential_mode ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              {/* Max Pages */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Pages
                </label>
                <input
                  type="number"
                  name="max_pages"
                  value={formData.max_pages}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  min="1"
                  max="1000"
                  required
                />
              </div>

              {/* Max Depth */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Depth
                </label>
                <input
                  type="number"
                  name="max_depth"
                  value={formData.max_depth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition"
                  min="0"
                  max="10"
                  required
                />
              </div>

              {/* Sequential Mode Toggle */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="sequential_mode"
                    checked={formData.sequential_mode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      sequential_mode: e.target.checked
                    }))}
                    className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-bold text-gray-800">Sequential Mode (Single Thread)</span>
                    <p className="text-xs text-gray-600 mt-1">
                      Run crawler with 1 thread to compare performance metrics with parallel mode
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
              >
                <FaRocket className="text-xl" />
                Start Crawling
              </button>
            </form>
          ) : (
            /* Progress View */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Oval
                  height={80}
                  width={80}
                  color="#4f46e5"
                  secondaryColor="#c7d2fe"
                  strokeWidth={4}
                />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {progress.status || 'Crawling...'}
                </h3>
                <p className="text-gray-600">
                  {progress.pages_crawled} / {progress.total} pages
                </p>
                <p className="text-sm text-indigo-600 font-semibold mt-2">
                  Mode: {progress.mode === 'sequential' ? '🔄 Sequential (1 Thread)' : '⚡ Parallel'}
                </p>
                {progress.elapsed_time > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Time Elapsed: {progress.elapsed_time}s
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500 flex items-center justify-center text-xs text-white font-semibold"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {progressPercentage}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-semibold text-blue-700">Threads</div>
                  <div className="text-2xl text-blue-900">{formData.threads}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-semibold text-purple-700">Max Pages</div>
                  <div className="text-2xl text-purple-900">{formData.max_pages}</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="font-semibold text-indigo-700">Max Depth</div>
                  <div className="text-2xl text-indigo-900">{formData.max_depth}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>✨ Powered by Python multi-threaded parallel crawler</p>
          <p className="mt-1">📊 22+ metrics per page | Real-time analysis | SEO scoring</p>
        </div>
      </div>
    </div>
  );
};

export default CrawlInputPage;
