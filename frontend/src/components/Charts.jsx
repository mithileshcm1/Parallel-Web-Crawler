import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell
} from 'recharts';

// SEO Score Distribution
export const SeoScoreChart = ({ results }) => {
  const scoreRanges = {
    'Excellent (80-100)': 0,
    'Good (60-79)': 0,
    'Fair (40-59)': 0,
    'Poor (0-39)': 0
  };

  results?.forEach(page => {
    const score = Number(page.seo_score) || 0;
    if (score >= 80) scoreRanges['Excellent (80-100)']++;
    else if (score >= 60) scoreRanges['Good (60-79)']++;
    else if (score >= 40) scoreRanges['Fair (40-59)']++;
    else scoreRanges['Poor (0-39)']++;
  });

  const data = Object.entries(scoreRanges).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">SEO Score Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Health Score Distribution
export const HealthScoreChart = ({ results }) => {
  const scoreRanges = {
    'Excellent (80-100)': 0,
    'Good (70-79)': 0,
    'Fair (60-69)': 0,
    'Poor (0-59)': 0
  };

  results?.forEach(page => {
    const score = Number(page.health_score) || 0;
    if (score >= 80) scoreRanges['Excellent (80-100)']++;
    else if (score >= 70) scoreRanges['Good (70-79)']++;
    else if (score >= 60) scoreRanges['Fair (60-69)']++;
    else scoreRanges['Poor (0-59)']++;
  });

  const data = Object.entries(scoreRanges).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Health Score Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Response Time vs Word Count - UPDATED WITH SORTING
export const ResponseTimeScatter = ({ results }) => {
  const data = (results || [])
    .map(p => ({
      wordCount: Number(p.word_count) || 0,
      responseTime: Number(p.response_time) || 0,
      url: p.url
    }))
    .sort((a, b) => a.wordCount - b.wordCount); // sort X ascending

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Response Time vs Word Count</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="wordCount" name="Word Count" />
          <YAxis dataKey="responseTime" name="Response Time (s)" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Pages" data={data} fill="#3b82f6" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

// Images vs Response Time - UPDATED WITH SORTING
export const ImagesResponseScatter = ({ results }) => {
  const data = (results || [])
    .map(p => ({
      images: Number(p.images) || 0,
      responseTime: Number(p.response_time) || 0,
      url: p.url
    }))
    .sort((a, b) => a.images - b.images); // sort X ascending

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Images vs Response Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="images" name="Images" />
          <YAxis dataKey="responseTime" name="Response Time (s)" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Pages" data={data} fill="#f59e0b" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

// Word Count Distribution
export const WordCountHistogram = ({ results }) => {
  const ranges = {
    '0-100': 0,
    '100-300': 0,
    '300-500': 0,
    '500-1000': 0,
    '1000+' : 0
  };

  results?.forEach(page => {
    const c = Number(page.word_count) || 0;
    if (c < 100) ranges['0-100']++;
    else if (c < 300) ranges['100-300']++;
    else if (c < 500) ranges['300-500']++;
    else if (c < 1000) ranges['500-1000']++;
    else ranges['1000+']++;
  });

  const data = Object.entries(ranges).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Word Count Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// H1/H2 Count Chart
export const HeadingChart = ({ results }) => {
  const bucket = { 'No H1': 0, '1 H1': 0, 'Multiple H1': 0, 'Has H2': 0, 'No H2': 0 };

  results?.forEach(p => {
    const h1 = Number(p.h1_tags) || 0;
    const h2 = Number(p.h2_tags) || 0;
    if (h1 === 0) bucket['No H1']++;
    else if (h1 === 1) bucket['1 H1']++;
    else bucket['Multiple H1']++;
    if (h2 > 0) bucket['Has H2']++; else bucket['No H2']++;
  });

  const data = Object.entries(bucket).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">H1/H2 Tag Analysis</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#ec4899" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Media Usage Chart
export const MediaUsageChart = ({ results }) => {
  const totalImages = results?.reduce((s, p) => s + (Number(p.images) || 0), 0) || 0;
  const totalVideos = results?.reduce((s, p) => s + (Number(p.videos) || 0), 0) || 0;
  const totalAudio  = results?.reduce((s, p) => s + (Number(p.audio)  || 0), 0) || 0;

  const data = [
    { name: 'Images', value: totalImages },
    { name: 'Videos', value: totalVideos },
    { name: 'Audio',  value: totalAudio }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Media Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Performance Distribution
export const PerformanceChart = ({ results }) => {
  const perf = { 'Fast (<1s)': 0, 'Good (1-2s)': 0, 'Slow (2-3s)': 0, 'Very Slow (>3s)': 0 };

  results?.forEach(p => {
    const t = Number(p.response_time) || 0;
    if (t < 1) perf['Fast (<1s)']++;
    else if (t < 2) perf['Good (1-2s)']++;
    else if (t < 3) perf['Slow (2-3s)']++;
    else perf['Very Slow (>3s)']++;
  });

  const data = Object.entries(perf).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
