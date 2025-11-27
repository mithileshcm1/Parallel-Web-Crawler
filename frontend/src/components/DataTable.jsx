import { useState, useMemo } from 'react';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaExternalLinkAlt } from 'react-icons/fa';

const DataTable = ({ results, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'seo_score', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 10;

  // Filtering
  const filteredResults = useMemo(() => {
    if (!results) return [];
    
    let filtered = results.filter(page => 
      page.url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply filters
    switch (filter) {
      case 'high-seo':
        filtered = filtered.filter(page => page.seo_score >= 80);
        break;
      case 'low-seo':
        filtered = filtered.filter(page => page.seo_score < 60);
        break;
      case 'fast':
        filtered = filtered.filter(page => page.response_time < 2);
        break;
      case 'slow':
        filtered = filtered.filter(page => page.response_time > 3);
        break;
      case 'thin':
        filtered = filtered.filter(page => page.thin_content);
        break;
      default:
        break;
    }

    return filtered;
  }, [results, searchTerm, filter]);

  // Sorting
  const sortedResults = useMemo(() => {
    if (!filteredResults) return [];
    
    const sorted = [...filteredResults].sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredResults, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Pages Analysis</h3>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by URL or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Pages</option>
            <option value="high-seo">High SEO (≥80)</option>
            <option value="low-seo">Low SEO (&lt;60)</option>
            <option value="fast">Fast (&lt;2s)</option>
            <option value="slow">Slow (&gt;3s)</option>
            <option value="thin">Thin Content</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {paginatedResults.length} of {sortedResults.length} pages
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'url', label: 'URL' },
                { key: 'seo_score', label: 'SEO Score' },
                { key: 'health_score', label: 'Health Score' },
                { key: 'word_count', label: 'Words' },
                { key: 'response_time', label: 'Response (s)' },
                { key: 'images', label: 'Images' },
                { key: 'videos', label: 'Videos' },
                { key: 'h1_tags', label: 'H1' },
                { key: 'status_code', label: 'Status' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {label}
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedResults.map((page, index) => (
              <tr
                key={index}
                onClick={() => onRowClick(page)}
                className="hover:bg-blue-50 cursor-pointer transition"
              >
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-xs" title={page.url}>
                      {page.url?.substring(0, 50)}...
                    </span>
                    <FaExternalLinkAlt className="text-blue-500 text-xs" />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(page.seo_score)}`}>
                    {page.seo_score || 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(page.health_score)}`}>
                    {page.health_score || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{page.word_count || 0}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={page.response_time > 3 ? 'text-red-600 font-semibold' : ''}>
                    {page.response_time?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{page.images || 0}</td>
                <td className="px-4 py-3 text-sm">{page.videos || 0}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={page.multiple_h1 ? 'text-red-600' : page.has_h1 ? 'text-green-600' : 'text-gray-400'}>
                    {page.h1_tags || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded ${page.status_code === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {page.status_code || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
