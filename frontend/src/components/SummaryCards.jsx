import { FaGlobe, FaChartLine, FaHeartbeat, FaFileAlt, FaExclamationTriangle, FaClock, FaLink, FaStopwatch } from 'react-icons/fa';

const SummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Pages',
      value: summary?.total_pages || 0,
      icon: <FaGlobe />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Avg SEO Score',
      value: summary?.avg_seo_score ? `${summary.avg_seo_score.toFixed(1)}/100` : '0',
      icon: <FaChartLine />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Avg Health Score',
      value: summary?.avg_health_score ? `${summary.avg_health_score.toFixed(1)}/100` : '0',
      icon: <FaHeartbeat />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Thin Content',
      value: summary?.thin_content_percent ? `${summary.thin_content_percent.toFixed(1)}%` : '0%',
      icon: <FaFileAlt />,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Broken Links',
      value: summary?.broken_links_count || 0,
      icon: <FaExclamationTriangle />,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    {
      title: 'Avg Response Time',
      value: summary?.avg_response_time ? `${summary.avg_response_time.toFixed(2)}s` : '0s',
      icon: <FaClock />,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    {
      title: 'Execution Time',
      value: summary?.execution_time ? `${summary.execution_time.toFixed(2)}s` : '0s',
      icon: <FaStopwatch />,
      color: 'teal',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      iconBg: 'bg-teal-100',
      subtitle: summary?.mode === 'sequential' ? '🔄 Sequential' : '⚡ Parallel'
    },
    {
      title: 'Most Linked Page',
      value: summary?.most_linked_page ? summary.most_linked_page.substring(0, 30) + '...' : 'N/A',
      icon: <FaLink />,
      color: 'pink',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
      fullValue: summary?.most_linked_page || 'N/A'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          title={card.fullValue}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} ${card.textColor} p-3 rounded-lg text-2xl`}>
              {card.icon}
            </div>
          </div>
          <div className="text-gray-600 text-sm font-medium mb-1">{card.title}</div>
          <div className={`${card.textColor} text-3xl font-bold`}>{card.value}</div>
          {card.subtitle && (
            <div className="text-xs text-gray-500 mt-2 font-semibold">
              {card.subtitle}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
