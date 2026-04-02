import { useState, useEffect } from 'react';
import { getDiscoverQueue } from '../api';
import AttemptModal from './AttemptModal';

export default function Discover() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    function load() {
        setLoading(true);
        getDiscoverQueue()
            .then(data => { setProblems(data); setLoading(false); })
            .catch(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div className="page-header">
                <div className="page-title">Discover</div>
                <div className="page-subtitle">
                    Problems recommended based on your topic weaknesses
                </div>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading recommendations...</div>
            ) : problems.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">o</div>
                    <div className="empty-text">No problems to discover right now.</div>
                </div>
            ) : (
                <>
                    <div className="section-header">
                        <div className="section-title">Your Queue</div>
                        <div className="section-badge">{problems.length} problems</div>
                    </div>
                    <div className="problem-list">
                        {problems.map(p => (
                            <div key={p.id} className="problem-row" onClick={() => setSelected(p)}>
                                <span className="problem-num">#{p.leetcodeId}</span>
                                <span className="problem-title">{p.title}</span>
                                <span className="problem-topic">{p.topic}</span>
                                <span className={"diff-badge diff-" + p.difficulty}>{p.difficulty}</span>

                                <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{color:'var(--accent)',textDecoration:'none'}}>open</a>
                            </div>
                            ))}
                    </div>
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <button className="btn btn-secondary" onClick={load} style={{ marginTop: '8px' }}>
                            Refresh Queue
                        </button>
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