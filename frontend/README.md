# Web Crawler Dashboard - React Frontend

Beautiful, modern React dashboard for the Python Parallel Web Crawler.

## 🎯 Features

- **2-Page Application**
  - Crawl Input Page with progress tracking
  - Comprehensive Dashboard with analytics

- **Real-time Progress**
  - Live progress bar during crawling
  - Auto-redirect to dashboard on completion

- **7 Summary Cards**
  - Total Pages, Avg SEO Score, Avg Health Score
  - Thin Content %, Broken Links, Avg Response Time, Most Linked Page

- **8 Interactive Charts**
  - SEO Score Distribution
  - Health Score Distribution
  - Response Time vs Word Count (Scatter)
  - Images vs Response Time (Scatter)
  - Word Count Distribution (Histogram)
  - H1/H2 Tag Analysis
  - Media Usage (Pie Chart)
  - Performance Distribution

- **3 Data Tables**
  - Pages Analysis (sortable, searchable, filterable)
  - Broken Links
  - Metadata Analysis

- **Advanced Features**
  - Page Details Modal with full metrics
  - Automated Recommendations
  - File Download Buttons (5 files)
  - Comprehensive Instructions Panel

## 📦 Installation

```bash
cd frontend
npm install
```

## 🚀 Running the Frontend

```bash
npm run dev
```

Frontend will run on **http://localhost:3000**

## 🔌 Backend Requirements

The frontend expects these API endpoints from your Python backend:

- `POST /api/crawl` - Start crawl
- `GET /api/progress` - Get crawl progress
- `GET /api/results` - Get analysis results
- `GET /api/summary` - Get summary statistics
- `GET /api/download?file=<name>` - Download files

Make sure your Python backend is running on **http://localhost:5000**

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── CrawlInputPage.jsx
│   │   └── DashboardPage.jsx
│   ├── components/
│   │   ├── SummaryCards.jsx
│   │   ├── Charts.jsx
│   │   ├── DataTable.jsx
│   │   ├── AdditionalTables.jsx
│   │   ├── PageDetailsModal.jsx
│   │   ├── Recommendations.jsx
│   │   ├── FileDownloadButtons.jsx
│   │   └── Instructions.jsx
│   ├── api/
│   │   └── crawlerApi.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Charts & visualizations
- **Axios** - API calls
- **React Icons** - Icons
- **React Loader Spinner** - Loading states
- **Vite** - Build tool

## 📊 Dashboard Sections

### 1. Summary Cards
- Quick overview of key metrics
- Color-coded for easy scanning

### 2. Charts & Visualizations
- 8 different chart types
- Interactive tooltips
- Responsive design

### 3. Data Tables
- Sortable columns
- Search functionality
- Filtering (High SEO, Low SEO, Fast, Slow, Thin Content)
- Pagination
- Click rows for details

### 4. Page Details Modal
- Full metrics breakdown
- SEO score components
- Content analysis
- Performance stats
- Automated recommendations

### 5. Recommendations
- Auto-generated insights
- Color-coded by severity
- Actionable suggestions

### 6. File Downloads
- All 5 crawler output files
- One-click downloads
- File descriptions

### 7. Instructions
- Metric explanations
- Best practices
- Architecture overview

## 🔧 Configuration

### API Base URL

Edit `src/api/crawlerApi.js` to change the backend URL:

```javascript
const API_BASE_URL = '/api';  // Uses proxy in dev
// OR
const API_BASE_URL = 'http://localhost:5000/api';  // Direct URL
```

### Proxy Configuration

The Vite proxy is configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

## 🎯 Usage

1. **Start the Backend**
   ```bash
   cd ..
   python api.py  # Your Flask/FastAPI backend
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

4. **Start Crawling**
   - Enter URL
   - Adjust threads (1-32)
   - Set max pages and depth
   - Click "Start Crawling"

5. **View Dashboard**
   - Automatically redirected when done
   - Explore charts, tables, and insights

## 📱 Responsive Design

- Mobile-friendly layout
- Tablet-optimized grids
- Desktop full-width experience

## 🎨 Color Scheme

- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#8b5cf6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)

## 🚀 Build for Production

```bash
npm run build
```

Builds to `dist/` folder. Serve with any static file server.

## 📝 Notes

- **No backend modifications required** - Frontend works with existing API
- All metrics (22+) displayed across various components
- Real-time progress updates every 1 second
- Optimized for performance with React best practices
- Fully accessible with keyboard navigation

## 🤝 Integration with Python Backend

The frontend seamlessly integrates with your existing Python crawler:

1. Backend generates files:
   - `crawl_results.txt`
   - `analysis_results.csv`
   - `broken_links.txt`
   - `link_frequency.txt`
   - `summary_report.txt`

2. Backend provides API endpoints (Flask/FastAPI)

3. Frontend consumes APIs and displays data

**Zero changes needed to your crawler code!**

## 🎉 Ready to Use

The frontend is production-ready and fully functional. Just ensure your backend API matches the expected endpoints and you're good to go!
