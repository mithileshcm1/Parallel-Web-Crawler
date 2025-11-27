# Quick Start Guide 🚀

## 1. Install Backend Dependencies

```powershell
pip install -r requirements.txt
```

This installs:
- `requests` - HTTP library
- `beautifulsoup4` - HTML parsing
- `tqdm` - Progress bars
- `flask` - Web framework
- `flask-cors` - Cross-origin resource sharing

## 2. Start the Backend API Server

```powershell
python api.py
```

You should see:
```
======================================================================
WEB CRAWLER API SERVER
======================================================================
Backend API: http://localhost:5000
Frontend should run on: http://localhost:3000

Available endpoints:
  POST   /api/crawl      - Start new crawl
  GET    /api/progress   - Get crawl progress
  GET    /api/results    - Get analysis results
  GET    /api/summary    - Get summary statistics
  GET    /api/download   - Download result files
======================================================================

 * Running on http://127.0.0.1:5000
```

**Keep this terminal open!**

## 3. Install Frontend Dependencies

Open a **new terminal** and run:

```powershell
cd frontend
npm install
```

This installs React, Vite, Tailwind CSS, Recharts, and other dependencies.

## 4. Start the Frontend Development Server

```powershell
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## 5. Open the Application

Navigate to: **http://localhost:3000**

You should see the **Web Crawler Dashboard** with a crawl input form.

## 6. Test the Full Flow

1. **Enter a URL** (e.g., https://www.example.com)
2. **Adjust Settings**:
   - Threads: 8 (default)
   - Max Pages: 50
   - Max Depth: 2
3. **Click "Start Crawling"**
4. **Watch Progress**: Real-time updates every second
5. **View Dashboard**: Auto-redirects on completion
6. **Explore Data**:
   - 7 summary cards
   - 8 interactive charts
   - 3 data tables (pages, broken links, metadata)
   - Click any page row to see detailed analysis
   - Download result files
   - View automated recommendations

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```powershell
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Import errors:**
```powershell
pip install --upgrade -r requirements.txt
```

### Frontend Issues

**Port 3000 already in use:**
- Vite will automatically suggest port 3001
- Or kill the process using port 3000

**npm install fails:**
```powershell
# Clear cache and retry
npm cache clean --force
npm install
```

**API connection errors:**
- Ensure backend is running on port 5000
- Check `vite.config.js` proxy settings
- Open browser console (F12) to see error details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│                 http://localhost:3000                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Requests
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              REACT FRONTEND (Vite)                          │
│  - CrawlInputPage: Form + Progress                          │
│  - DashboardPage: Charts + Tables + Modal                   │
│  - API Layer: Axios client                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Vite Proxy: /api → localhost:5000
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               FLASK API (api.py)                            │
│  - POST /api/crawl: Start crawler in background thread      │
│  - GET /api/progress: Poll crawl status                     │
│  - GET /api/results: Read analysis_results.csv              │
│  - GET /api/summary: Aggregate statistics                   │
│  - GET /api/download: Serve result files                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Python Function Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│         PARALLEL WEB CRAWLER (crawler.py)                   │
│  - Multi-threaded crawling (n workers)                      │
│  - Parallel analysis (n/2 workers)                          │
│  - 22+ metrics per page                                     │
│  - SEO scoring (6 factors)                                  │
│  - Health scoring (4 components)                            │
│  - Output: CSV + TXT files                                  │
└─────────────────────────────────────────────────────────────┘
```

## What's Next?

- **Test with different websites**: Try various domains and complexity levels
- **Experiment with threading**: Adjust worker count to optimize speed
- **Analyze results**: Use charts and tables to identify SEO opportunities
- **Export data**: Download CSV files for further analysis in Excel/Python
- **Customize thresholds**: Modify `crawler.py` scoring algorithms (if needed)

## File Structure

```
parallel_web_crawler_final/
├── api.py                      # Flask API server
├── crawler.py                  # Core crawler logic
├── main.py                     # CLI entry point
├── utils.py                    # Utility functions
├── requirements.txt            # Python dependencies
├── QUICKSTART.md              # This file
├── README.md                   # Project documentation
└── frontend/                   # React application
    ├── package.json            # Node dependencies
    ├── vite.config.js          # Vite configuration
    ├── tailwind.config.js      # Tailwind CSS config
    ├── index.html              # HTML template
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Router setup
        ├── index.css           # Global styles
        ├── api/
        │   └── crawlerApi.js   # API client
        ├── pages/
        │   ├── CrawlInputPage.jsx
        │   └── DashboardPage.jsx
        └── components/
            ├── SummaryCards.jsx
            ├── Charts.jsx
            ├── DataTable.jsx
            ├── AdditionalTables.jsx
            ├── PageDetailsModal.jsx
            ├── Recommendations.jsx
            ├── FileDownloadButtons.jsx
            └── Instructions.jsx
```

## Support

For issues or questions:
1. Check browser console (F12) for frontend errors
2. Check terminal output for backend errors
3. Review crawler output files for data issues
4. Verify both servers are running on correct ports

Happy Crawling! 🕷️
