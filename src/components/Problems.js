import { useState, useEffect } from 'react';
import { getProblems, getAttempts, getReviewQueue, updateNotes, updateAttempt, deleteAttempt } from '../api';
import AttemptModal from './AttemptModal';

const DIFFS = ['ALL', 'EASY', 'MEDIUM', 'HARD'];
const RESULTS = ['FAIL', 'PASS', 'EASY'];

export default function Problems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [diff, setDiff] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [showAttempted, setShowAttempted] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [attemptedIds, setAttemptedIds] = useState(new Set());
    const [editingAttempt, setEditingAttempt] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [editingProblemNotes, setEditingProblemNotes] = useState(null);
    const [problemNotesValue, setProblemNotesValue] = useState('');

    useEffect(() => {
        Promise.all([getProblems(), getReviewQueue()])
            .then(([data, review]) => {
                setProblems(data);
                setAttemptedIds(new Set(review.map(p => p.id)));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    async function handleExpand(p) {
        if (expanded === p.id) { setExpanded(null); return; }
        setExpanded(p.id);
        const a = await getAttempts(p.id);
        setAttempts(a);
    }

    async function handleSaveAttempt(attemptId) {
        const original = attempts.find(a => a.id === attemptId);
        const updated = await updateAttempt(attemptId, {
            ...original,
            result: editValues.result,
            confidence: editValues.confidence,
            notes: editValues.notes,
            timeSpentMinutes: editValues.timeSpentMinutes ? parseInt(editValues.timeSpentMinutes) : null,
            flaggedForReview: original.flaggedForReview,
        });
        setAttempts(attempts.map(a => a.id === attemptId ? updated : a));
        setEditingAttempt(null);
    }

    async function handleDeleteAttempt(attemptId, problemId) {
        await deleteAttempt(attemptId);
        const remaining = attempts.filter(a => a.id !== attemptId);
        setAttempts(remaining);
        if (remaining.length === 0) {
            setAttemptedIds(prev => { const next = new Set(prev); next.delete(problemId); return next; });
        }
    }

    async function handleSaveProblemNotes(problem) {
        const updated = await fetch(`http://localhost:8080/problems/${problem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...problem, notes: problemNotesValue }),
        });
        const data = await updated.json();
        setProblems(problems.map(p => p.id === problem.id ? data : p));
        setEditingProblemNotes(null);
    }

    const filtered = problems.filter(p => {
        const matchDiff = diff === 'ALL' || p.difficulty === diff;
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.topic && p.topic.toLowerCase().includes(search.toLowerCase()));
        const matchAttempted = !showAttempted || attemptedIds.has(p.id);
        const matchNotes = !showNotes || (p.notes && p.notes.trim() !== '');
        return matchDiff && matchSearch && matchAttempted && matchNotes;
    });

    return (
        <div>
            <div className="page-header">
                <div className="page-title">All Problems</div>
                <div className="page-subtitle">{problems.length.toLocaleString()} problems — click title to see attempts</div>
            </div>

            <div className="filter-bar">
                <input className="search-input" placeholder="Search by title or topic..." value={search} onChange={e => setSearch(e.target.value)} />
                {DIFFS.map(d => (
                    <button key={d} className={"filter-btn" + (diff === d ? " active" : "")} onClick={() => setDiff(d)}>{d}</button>
                ))}
                <button className={"filter-btn" + (showAttempted ? " active" : "")} onClick={() => setShowAttempted(!showAttempted)}>Attempted</button>
                <button className={"filter-btn" + (showNotes ? " active" : "")} onClick={() => setShowNotes(!showNotes)}>Has Notes</button>
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /> Loading problems...</div>
            ) : (
                <div className="problem-list">
                    {filtered.slice(0, 200).map(p => (
                        <div key={p.id}>
                            <div className="problem-row">
                                <span className="problem-num">#{p.leetcodeId}</span>
                                <span className="problem-title" onClick={() => handleExpand(p)} style={{cursor:'pointer'}}>{p.title}</span>
                                {attemptedIds.has(p.id) && <span style={{fontSize:'11px',color:'var(--easy)',fontFamily:'Space Mono',border:'1px solid rgba(0,229,204,0.2)',padding:'2px 6px',borderRadius:'4px'}}>done</span>}
                                <span className="problem-topic">{p.topic}</span>
                                <span className={"diff-badge diff-" + p.difficulty}>{p.difficulty}</span>
                                <button className="btn btn-secondary" style={{padding:'4px 12px',fontSize:'12px'}} onClick={() => setSelected(p)}>+ Log</button>
                                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{color:'var(--accent)',textDecoration:'none'}}>open</a>
                            </div>

                            {expanded === p.id && (
                                <div style={{padding:'12px 18px 16px',background:'var(--bg3)',borderRadius:'0 0 10px 10px',marginTop:'-8px',marginBottom:'4px',border:'1px solid var(--border)',borderTop:'none'}}>

                                    {/* Problem Notes */}
                                    <div style={{marginBottom:'16px',padding:'12px',background:'var(--bg2)',borderRadius:'8px',border:'1px solid var(--border)'}}>
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom: editingProblemNotes === p.id || p.notes ? '10px' : '0'}}>
                                            <span style={{fontSize:'12px',fontWeight:'700',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Problem Notes</span>
                                            <button onClick={() => { setEditingProblemNotes(p.id); setProblemNotesValue(p.notes || ''); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:'4px',color:'var(--muted)',fontSize:'11px',padding:'2px 8px',cursor:'pointer'}}>
                                                {p.notes ? 'edit' : '+ add'}
                                            </button>
                                        </div>
                                        {editingProblemNotes === p.id ? (
                                            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                                                <textarea className="form-textarea" value={problemNotesValue} onChange={e => setProblemNotesValue(e.target.value)} placeholder="Permanent notes about this problem — patterns, tricks, key insight..." style={{minHeight:'70px',fontSize:'13px'}} autoFocus />
                                                <div style={{display:'flex',gap:'8px'}}>
                                                    <button className="btn btn-primary" style={{padding:'6px 14px',fontSize:'12px'}} onClick={() => handleSaveProblemNotes(p)}>Save</button>
                                                    <button className="btn btn-secondary" style={{padding:'6px 14px',fontSize:'12px'}} onClick={() => setEditingProblemNotes(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : p.notes ? (
                                            <div style={{fontSize:'14px',color:'var(--text)',lineHeight:'1.6',padding:'8px 12px',background:'rgba(0,229,204,0.06)',borderRadius:'6px',borderLeft:'3px solid var(--easy)'}}>{p.notes}</div>
                                        ) : (
                                            <div style={{fontSize:'13px',color:'var(--muted)'}}>No problem notes yet.</div>
                                        )}
                                    </div>

                                    {/* Attempts */}
                                    <div style={{fontSize:'12px',fontWeight:'700',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'10px'}}>Attempts</div>
                                    {attempts.length === 0 ? (
                                        <div style={{fontSize:'13px',color:'var(--muted)',padding:'8px 0'}}>No attempts yet.</div>
                                    ) : attempts.map(a => (
                                        <div key={a.id} style={{marginBottom:'12px',padding:'12px',background:'var(--bg2)',borderRadius:'8px',border:'1px solid var(--border)'}}>
                                            {editingAttempt === a.id ? (
                                                <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        {RESULTS.map(r => (
                                                            <button key={r} className={"rating-btn" + (editValues.result === r ? " selected" : "")} onClick={() => setEditValues({...editValues, result: r})}>{r}</button>
                                                        ))}
                                                    </div>
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        {[1,2,3,4,5].map(n => (
                                                            <button key={n} className={"rating-btn" + (editValues.confidence === n ? " selected" : "")} onClick={() => setEditValues({...editValues, confidence: n})}>{n}</button>
                                                        ))}
                                                    </div>
                                                    <input className="form-input" type="number" placeholder="Time spent (minutes)" value={editValues.timeSpentMinutes || ''} onChange={e => setEditValues({...editValues, timeSpentMinutes: e.target.value})} style={{fontSize:'13px'}} />
                                                    <textarea className="form-textarea" value={editValues.notes || ''} onChange={e => setEditValues({...editValues, notes: e.target.value})} placeholder="Notes..." style={{minHeight:'60px',fontSize:'13px'}} />
                                                    <div style={{display:'flex',gap:'8px'}}>
                                                        <button className="btn btn-primary" style={{padding:'6px 14px',fontSize:'12px'}} onClick={() => handleSaveAttempt(a.id)}>Save</button>
                                                        <button className="btn btn-secondary" style={{padding:'6px 14px',fontSize:'12px'}} onClick={() => setEditingAttempt(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom: a.notes ? '10px' : '0'}}>
                                                        <span className={"result-" + a.result}>{a.result}</span>
                                                        <span style={{fontSize:'13px',color:'var(--text)'}}>Confidence: {a.confidence}/5</span>
                                                        {a.timeSpentMinutes && <span style={{fontSize:'12px',color:'var(--muted)'}}>{a.timeSpentMinutes} min</span>}
                                                        <span style={{marginLeft:'auto',fontSize:'11px',color:'var(--muted)',fontFamily:'Space Mono'}}>{a.date}</span>
                                                        <button onClick={() => { setEditingAttempt(a.id); setEditValues({result: a.result, confidence: a.confidence, notes: a.notes || '', timeSpentMinutes: a.timeSpentMinutes || ''}); }} style={{background:'none',border:'1px solid var(--border)',borderRadius:'4px',color:'var(--muted)',fontSize:'11px',padding:'2px 8px',cursor:'pointer'}}>edit</button>
                                                        <button onClick={() => handleDeleteAttempt(a.id, p.id)} style={{background:'none',border:'1px solid rgba(244,63,94,0.3)',borderRadius:'4px',color:'var(--hard)',fontSize:'11px',padding:'2px 8px',cursor:'pointer'}}>delete</button>
                                                    </div>
                                                    {a.notes && (
                                                        <div style={{fontSize:'14px',color:'var(--text)',lineHeight:'1.6',padding:'8px 12px',background:'rgba(124,107,255,0.06)',borderRadius:'6px',borderLeft:'3px solid var(--accent)'}}>{a.notes}</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {filtered.length > 200 && (
                        <div style={{textAlign:'center',padding:'16px',color:'var(--muted)',fontSize:'13px'}}>
                            Showing 200 of {filtered.length} results — use search to narrow down
                        </div>
                    )}
                    {filtered.length === 0 && (
                        <div className="empty">
                            <div className="empty-icon">≡</div>
                            <div className="empty-text">No problems match your filters.</div>
                        </div>
                    )}
                </div>
            )}

            {selected && (
                <AttemptModal problem={selected} onClose={() => setSelected(null)} onSaved={() => setSelected(null)} />
            )}
        </div>
    );
}