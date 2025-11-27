import { FaExternalLinkAlt } from 'react-icons/fa';

export const BrokenLinksTable = ({ brokenLinks }) => {
  if (!brokenLinks || brokenLinks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Broken Links</h3>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-xl text-green-600 font-semibold">No broken links found!</p>
          <p className="text-gray-500 mt-2">All pages returned successful responses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Broken Links <span className="text-red-600">({brokenLinks.length})</span>
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-red-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">URL</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brokenLinks.map((link, index) => (
              <tr key={index} className="hover:bg-red-50">
                <td className="px-4 py-3 text-sm">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    {link.url}
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    {link.status || 'ERROR'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{link.error || 'Unknown error'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MetadataTable = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Metadata Analysis</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">URL</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title Length</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Meta Desc Length</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Missing Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.slice(0, 20).map((page, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm truncate max-w-xs" title={page.url}>
                  {page.url?.substring(0, 40)}...
                </td>
                <td className="px-4 py-3 text-sm truncate max-w-xs" title={page.title}>
                  {page.title || 'Untitled'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`${page.title_too_short ? 'text-red-600 font-semibold' : page.title_too_long ? 'text-orange-600' : 'text-green-600'}`}>
                    {page.title_length || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={page.meta_desc_length > 0 ? 'text-green-600' : 'text-gray-400'}>
                    {page.meta_desc_length || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {page.missing_meta_desc ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Missing
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      ✓
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {results.length > 20 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing 20 of {results.length} pages
        </div>
      )}
    </div>
  );
};
