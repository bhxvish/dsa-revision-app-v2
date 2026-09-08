import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ProblemListPage from './pages/ProblemListPage';
import QuickRecallPage from './pages/QuickRecallPage';
import BulkTriagePage from './pages/BulkTriagePage';
import RedQueuePage from './pages/RedQueuePage';
import PracticeViewPage from './pages/PracticeViewPage';
import PatternLibraryPage from './pages/PatternLibraryPage';
import NotesPage from './pages/NotesPage';
import MockLogPage from './pages/MockLogPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/problems', label: 'Problems' },
  { to: '/recall', label: 'Quick Recall' },
  { to: '/red-queue', label: 'Red Queue' },
  { to: '/bulk-add', label: 'Bulk Add' },
  { to: '/templates', label: 'Pattern Library' },
  { to: '/notes', label: 'Notes' },
  { to: '/mock-log', label: 'Mock Log' },
  { to: '/analytics', label: 'Analytics' },
];

export default function App() {
  return (
    <div className="app-shell">
      <nav className="navbar">
        <span className="app-title">DSA Tracker</span>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <ThemeToggle />
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/problems" element={<ProblemListPage />} />
          <Route path="/recall" element={<QuickRecallPage />} />
          <Route path="/red-queue" element={<RedQueuePage />} />
          <Route path="/bulk-add" element={<BulkTriagePage />} />
          <Route path="/practice/:problemId" element={<PracticeViewPage />} />
          <Route path="/templates" element={<PatternLibraryPage />} />
          <Route path="/templates/:pattern" element={<PatternLibraryPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/mock-log" element={<MockLogPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </main>
    </div>
  );
}
