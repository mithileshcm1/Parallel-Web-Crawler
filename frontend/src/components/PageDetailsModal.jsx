import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

const PageDetailsModal = ({ page, onClose }) => {
  if (!page) return null;

  const getScoreLabel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-600' };
    if (score >= 40) return { label: 'Fair', color: 'text-orange-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  const seoLabel = getScoreLabel(page.seo_score);
  const healthLabel = getScoreLabel(page.health_score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{page.title || 'Untitled Page'}</h2>
            <a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-100 hover:text-white flex items-center gap-2 text-sm"
            >
              {page.url} <FaExternalLinkAlt />
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scores Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="text-sm text-gray-600 mb-1">SEO Score</div>
              <div className="text-4xl font-bold text-green-700">{page.seo_score || 0}</div>
              <div className={`text-sm font-semibold ${seoLabel.color}`}>{seoLabel.label}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Health Score</div>
              <div className="text-4xl font-bold text-purple-700">{page.health_score || 0}</div>
              <div className={`text-sm font-semibold ${healthLabel.color}`}>{healthLabel.label}</div>
            </div>
          </div>

          {/* SEO Breakdown */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">SEO Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">H1 Tags:</span>
                <span className={`font-semibold ${page.has_h1 ? 'text-green-600' : 'text-red-600'}`}>
                  {page.h1_tags || 0} {page.multiple_h1 && '(Multiple ⚠️)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">H2 Tags:</span>
                <span className="font-semibold">{page.h2_tags || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Title Length:</span>
                <span className={`font-semibold ${page.title_too_short ? 'text-red-600' : page.title_too_long ? 'text-orange-600' : 'text-green-600'}`}>
                  {page.title_length || 0} chars
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Meta Description:</span>
                <span className={`font-semibold ${page.missing_meta_desc ? 'text-red-600' : 'text-green-600'}`}>
                  {page.missing_meta_desc ? 'Missing ❌' : `${page.meta_desc_length} chars ✓`}
                </span>
              </div>
            </div>
          </div>

          {/* Content Metrics */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Content Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{page.word_count || 0}</div>
                <div className="text-sm text-gray-600">Words</div>
                {page.thin_content && <div className="text-xs text-red-600 font-semibold mt-1">Thin Content</div>}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700">{page.images || 0}</div>
                <div className="text-sm text-gray-600">Images</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-700">{page.videos || 0}</div>
                <div className="text-sm text-gray-600">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-700">{page.audio || 0}</div>
                <div className="text-sm text-gray-600">Audio</div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-yellow-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-700">{page.response_time?.toFixed(2) || '0.00'}s</div>
                <div className="text-sm text-gray-600">Response Time</div>
                {page.response_time > 3 && <div className="text-xs text-red-600 font-semibold mt-1">Slow ⚠️</div>}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">{page.status_code || 'N/A'}</div>
                <div className="text-sm text-gray-600">Status Code</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{page.depth || 0}</div>
                <div className="text-sm text-gray-600">Depth</div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Link Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">{page.links || 0}</div>
                <div className="text-sm text-gray-600">Total Links</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-700">{page.images || 0}</div>
                <div className="text-sm text-gray-600">Media Elements</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
            <h3 className="text-lg font-bold text-red-800 mb-4">Recommendations</h3>
            <ul className="space-y-2 text-sm">
              {!page.has_h1 && <li className="text-red-700">• Add an H1 tag to improve SEO</li>}
              {page.multiple_h1 && <li className="text-red-700">• Remove duplicate H1 tags (SEO best practice: only 1 H1)</li>}
              {page.title_too_short && <li className="text-red-700">• Increase title length (minimum 30 characters recommended)</li>}
              {page.title_too_long && <li className="text-orange-700">• Shorten title length (maximum 60 characters recommended)</li>}
              {page.missing_meta_desc && <li className="text-red-700">• Add a meta description (150-160 characters)</li>}
              {page.thin_content && <li className="text-red-700">• Add more content (minimum 300 words recommended)</li>}
              {page.response_time > 3 && <li className="text-red-700">• Optimize page load time (currently {page.response_time?.toFixed(2)}s)</li>}
              {page.h2_tags === 0 && page.word_count > 300 && <li className="text-orange-700">• Add H2 headings to improve content structure</li>}
              {page.seo_score >= 90 && <li className="text-green-700">✓ Excellent SEO! No major issues found.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageDetailsModal;
