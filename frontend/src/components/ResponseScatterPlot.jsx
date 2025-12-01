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
  // Helper function to aggregate data by X-axis and average Y-axis values
  const aggregateByX = (dataPoints) => {
    const grouped = {};
    
    dataPoints.forEach((point) => {
      const xValue = point.x;
      if (!grouped[xValue]) {
        grouped[xValue] = {
          x: xValue,
          yValues: [],
          urls: [],
        };
      }
      grouped[xValue].yValues.push(point.y);
      grouped[xValue].urls.push(point.url);
    });

    // Calculate averages and create final data points
    return Object.values(grouped)
      .map((group) => ({
        x: group.x,
        y: group.yValues.reduce((sum, val) => sum + val, 0) / group.yValues.length,
        count: group.yValues.length,
        urls: group.urls,
      }))
      .sort((a, b) => a.x - b.x);
  };

  // Transform data for Response Time vs Word Count
  const rawWordCountData = data.map((page) => ({
    x: page.word_count || 0,
    y: page.response_time || 0,
    url: page.url,
  }));
  const wordCountData = aggregateByX(rawWordCountData);
  
  // Get unique X values for word count axis ticks (limit to max 10 ticks)
  const allWordCountTicks = [...new Set(wordCountData.map(d => d.x))].sort((a, b) => a - b);
  const wordCountTicks = allWordCountTicks.length > 10 
    ? allWordCountTicks.filter((_, i) => i % Math.ceil(allWordCountTicks.length / 10) === 0)
    : allWordCountTicks;

  // Transform data for Images vs Response Time
  const rawImagesData = data.map((page) => ({
    x: page.images || 0,
    y: page.response_time || 0,
    url: page.url,
  }));
  const imagesData = aggregateByX(rawImagesData);
  
  // Get unique X values for images axis ticks (limit to max 10 ticks)
  const allImagesTicks = [...new Set(imagesData.map(d => d.x))].sort((a, b) => a - b);
  const imagesTicks = allImagesTicks.length > 10
    ? allImagesTicks.filter((_, i) => i % Math.ceil(allImagesTicks.length / 10) === 0)
    : allImagesTicks;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-sm text-gray-700">
            X Value: {point.x}
          </p>
          <p className="text-blue-600">
            Avg Response Time: {point.y.toFixed(3)}s
          </p>
          <p className="text-gray-600 text-xs">
            ({point.count} page{point.count > 1 ? 's' : ''})
          </p>
          {point.count <= 3 && (
            <div className="mt-2 text-xs text-gray-500 max-w-xs">
              {point.urls.map((url, idx) => (
                <p key={idx} className="truncate">{url}</p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Response Time vs Word Count
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Word Count"
            ticks={wordCountTicks}
            domain={['dataMin', 'dataMax']}
            allowDuplicatedCategory={false}
            interval={0}
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
  );
};

export default ResponseScatterPlot;