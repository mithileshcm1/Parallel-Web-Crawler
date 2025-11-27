import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ResponseScatterPlot = ({ data }) => {
  // Transform and SORT data for Response Time vs Word Count
  const wordCountData = data
    .map((page) => ({
      x: page.word_count || 0,
      y: page.response_time || 0,
      url: page.url,
    }))
    .sort((a, b) => a.x - b.x); // Sort by word_count (X-axis) in ascending order

  // Transform and SORT data for Images vs Response Time
  const imagesData = data
    .map((page) => ({
      x: page.images || 0,
      y: page.response_time || 0,
      url: page.url,
    }))
    .sort((a, b) => a.x - b.x); // Sort by images (X-axis) in ascending order

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm truncate max-w-xs">
            {payload[0].payload.url}
          </p>
          <p className="text-blue-600">X: {payload[0].payload.x}</p>
          <p className="text-green-600">
            Response Time: {payload[0].payload.y.toFixed(2)}s
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Response Time vs Word Count */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Response Time vs Word Count
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Word Count"
              label={{
                value: 'Word Count',
                position: 'insideBottom',
                offset: -10,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Response Time"
              label={{
                value: 'Response Time (s)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              name="Response Time vs Word Count"
              data={wordCountData}
              fill="#8884d8"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Images vs Response Time */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Images vs Response Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Images"
              label={{
                value: 'Number of Images',
                position: 'insideBottom',
                offset: -10,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Response Time"
              label={{
                value: 'Response Time (s)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Scatter
              name="Images vs Response Time"
              data={imagesData}
              fill="#82ca9d"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResponseScatterPlot;