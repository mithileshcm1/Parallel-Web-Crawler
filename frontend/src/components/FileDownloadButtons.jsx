import { FaDownload, FaFileAlt, FaFileCsv, FaExclamationCircle, FaListAlt, FaFileContract } from 'react-icons/fa';
import { downloadFile } from '../api/crawlerApi';

const FileDownloadButtons = () => {
  const files = [
    {
      name: 'crawl_results.txt',
      label: 'Crawl Results',
      icon: <FaFileAlt />,
      description: 'Basic crawl information',
      color: 'blue'
    },
    {
      name: 'analysis_results.csv',
      label: 'Analysis Results',
      icon: <FaFileCsv />,
      description: 'Detailed metrics (22+ columns)',
      color: 'green'
    },
    {
      name: 'broken_links.txt',
      label: 'Broken Links',
      icon: <FaExclamationCircle />,
      description: 'List of broken URLs',
      color: 'red'
    },
    {
      name: 'link_frequency.txt',
      label: 'Link Frequency',
      icon: <FaListAlt />,
      description: 'Most linked pages',
      color: 'purple'
    },
    {
      name: 'summary_report.txt',
      label: 'Summary Report',
      icon: <FaFileContract />,
      description: 'Comprehensive analysis',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FaDownload className="text-blue-600" />
        Download Reports
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => downloadFile(file.name)}
            className={`${getColorClasses(file.color)} border-2 rounded-xl p-6 transition transform hover:scale-105 shadow-md`}
          >
            <div className="text-4xl mb-3">{file.icon}</div>
            <div className="font-bold text-lg mb-1">{file.label}</div>
            <div className="text-sm opacity-75">{file.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">📋 File Descriptions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Crawl Results:</strong> URL, depth, status, title for each page</li>
          <li>• <strong>Analysis Results:</strong> Full CSV with all 22+ metrics per page</li>
          <li>• <strong>Broken Links:</strong> URLs that returned errors or 404s</li>
          <li>• <strong>Link Frequency:</strong> Pages ranked by internal link count</li>
          <li>• <strong>Summary Report:</strong> Automated insights and recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default FileDownloadButtons;
