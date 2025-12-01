import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResults, getSummary } from '../api/crawlerApi';
import { Oval } from 'react-loader-spinner';
import { FaHome, FaSpider } from 'react-icons/fa';

// Components
import SummaryCards from '../components/SummaryCards';
import {
  SeoScoreChart,
  HealthScoreChart,
  ResponseTimeScatter,
  WordCountHistogram,
  MediaUsageChart,
  PerformanceChart
} from '../components/Charts';
import DataTable from '../components/DataTable';
import { BrokenLinksTable, MetadataTable } from '../components/AdditionalTables';
import PageDetailsModal from '../components/PageDetailsModal';
import Recommendations from '../components/Recommendations';
import FileDownloadButtons from '../components/FileDownloadButtons';
import Instructions from '../components/Instructions';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [brokenLinks, setBrokenLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resultsData, summaryData] = await Promise.all([
        getResults(),
        getSummary()
      ]);
      
      setResults(resultsData);
      setSummary(summaryData);
      
      // Extract broken links from results
      const broken = resultsData.filter(page => 
        page.status_code !== 200 || page.error
      );
      setBrokenLinks(broken);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load results');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Oval height={80} width={80} color="#4f46e5" secondaryColor="#c7d2fe" />
          <p className="text-gray-600 mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Start New Crawl
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaSpider className="text-4xl text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-800">Crawler Dashboard</h1>
            </div>
            <p className="text-gray-600">Comprehensive website analysis & SEO insights</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 font-semibold"
          >
            <FaHome /> New Crawl
          </button>
        </div>

        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Charts Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Analytics & Visualizations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeoScoreChart results={results} />
            <HealthScoreChart results={results} />
            <ResponseTimeScatter results={results} />
            <WordCountHistogram results={results} />
            <MediaUsageChart results={results} />
            <PerformanceChart results={results} />
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <Recommendations summary={summary} results={results} />
        </div>

        {/* Data Tables */}
        <div className="mb-8">
          <DataTable results={results} onRowClick={setSelectedPage} />
        </div>

        {/* Additional Tables */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <BrokenLinksTable brokenLinks={brokenLinks} />
          <MetadataTable results={results} />
        </div>

        {/* File Downloads */}
        <div className="mb-8">
          <FileDownloadButtons />
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <Instructions />
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm py-6">
          <p>🚀 Powered by Python Multi-threaded Parallel Web Crawler</p>
          <p className="mt-1">
            Crawled {summary?.total_pages || 0} pages | 
            Avg SEO: {summary?.avg_seo_score?.toFixed(1) || 0}/100 | 
            Avg Response: {summary?.avg_response_time?.toFixed(2) || 0}s
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedPage && (
        <PageDetailsModal page={selectedPage} onClose={() => setSelectedPage(null)} />
      )}
    </div>
  );
};

export default DashboardPage;
