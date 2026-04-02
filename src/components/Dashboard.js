import { useState, useEffect } from 'react';
import { getProblems, getReviewQueue, getDiscoverQueue } from '../api';

export default function Dashboard({ setPage }) {
    const [stats, setStats] = useState({ total: 0, review: 0, discover: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getProblems(), getReviewQueue(), getDiscoverQueue()])
            .then(([problems, review, discover]) => {
                setStats({ total: problems.length, review: review.length, discover: discover.length });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div>
            <div className="top-bar">
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="greeting">{greeting} — ready to practice?</div>
                </div>
                <div className="score-display">⬡ CodeQueue</div>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading...</div>
            ) : (
                <>
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Problems</div>
                            <div className="stat-value stat-accent">{stats.total.toLocaleString()}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Ready to Review</div>
                            <div className="stat-value stat-amber">{stats.review}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">To Discover</div>
                            <div className="stat-value stat-teal">{stats.discover}</div>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <button className="action-btn action-btn-primary" onClick={() => setPage('discover')}>
                            <span>◎</span> Discover Problems
                        </button>
                        <button className="action-btn" onClick={() => setPage('review')}>
                            <span>↻</span> Review Queue
                        </button>
                        <button className="action-btn" onClick={() => setPage('problems')}>
                            <span>≡</span> All Problems
                        </button>
                    </div>

                    <div className="card">
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⬡</div>
                            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Start Practicing</div>
                            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '24px' }}>
                                Use Discover to find new problems based on your weak topics,<br />
                                or Review to revisit problems you have already attempted.
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button className="btn btn-primary" onClick={() => setPage('discover')} style={{ minWidth: '140px' }}>
                                    Start Discovering
                                </button>
                                <button className="btn btn-secondary" onClick={() => setPage('review')}>
                                    Review Queue
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}