import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CrawlInputPage from './pages/CrawlInputPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CrawlInputPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
