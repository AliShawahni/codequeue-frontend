import { useState, useEffect } from 'react';
import { getReviewQueue } from '../api';
import AttemptModal from './AttemptModal';

export default function Review() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    function load() {
        setLoading(true);
        getReviewQueue()
            .then(data => { setProblems(data); setLoading(false); })
            .catch(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Review</div>
                <div className="page-subtitle">
                    Problems ranked by recency, result, and confidence — highest priority first
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading review queue...</div>
            ) : problems.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">↻</div>
                    <div className="empty-text">
                        No problems to review yet.<br />
                        Start by solving problems in the Discover tab.
                    </div>
                </div>
            ) : (
                <>
                    <div className="section-header">
                        <div className="section-title">Priority Queue</div>
                        <div className="section-badge">{problems.length} to review</div>
                    </div>
                    <div className="problem-list">
                        {problems.map((p, i) => (
                            <div key={p.id} className="problem-row" onClick={() => setSelected(p)}>
                <span className="problem-num" style={{ color: i === 0 ? 'var(--hard)' : i < 3 ? 'var(--medium)' : undefined }}>
                  #{i + 1}
                </span>
                                <span className="problem-num" style={{ color: 'var(--muted)' }}>·{p.leetcodeId}</span>
                                <span className="problem-title">{p.title}</span>
                                <span className="problem-topic">{p.topic}</span>
                                <span className={"diff-badge diff-" + p.difficulty}>{p.difficulty}</span>

                                <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{color:'var(--accent)',textDecoration:'none'}}>open</a>
                            </div>
                            ))}
                    </div>
                </>
            )}

            {selected && (
                <AttemptModal
                    problem={selected}
                    onClose={() => setSelected(null)}
                    onSaved={() => { setSelected(null); load(); }}
                />
            )}
        </div>
    );
}