import { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Problems from './components/Problems';
import Discover from './components/Discover';
import Review from './components/Review';
import Topics from './components/Topics';
import MockInterview from './components/MockInterview';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'discover', label: 'Discover', icon: '◎' },
  { id: 'review', label: 'Review', icon: '↻' },
  { id: 'problems', label: 'All Problems', icon: '≡' },
    { id: 'topics', label: 'Topics', icon: '◉' },
    { id: 'mock', label: 'Mock Interview', icon: '⌨' },

];

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">CodeQueue</span>
          </div>
          <nav className="nav">
            {NAV.map(n => (
                <button
                    key={n.id}
                    className={"nav-item" + (page === n.id ? " active" : "")}
                    onClick={() => setPage(n.id)}
                >
                  <span className="nav-icon">{n.icon}</span>
                  <span className="nav-label">{n.label}</span>
                </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span className="version">v1.0.0</span>
          </div>
        </aside>
        <main className="main">
          {page === 'dashboard' && <Dashboard setPage={setPage} />}
          {page === 'discover' && <Discover />}
          {page === 'review' && <Review />}
          {page === 'problems' && <Problems />}
          {page === 'topics' && <Topics />}
          {page === 'mock' && <MockInterview />}
        </main>
      </div>
  );
}