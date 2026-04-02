import { useState, useEffect } from "react";
import { getTopicStats, getTopicRecommendations, getTopicNotes, updateTopicNotes } from "../api";

export default function Topics() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [recs, setRecs] = useState([]);
    const [recsMode, setRecsMode] = useState("discover");
    const [recsLoading, setRecsLoading] = useState(false);
    const [sortBy, setSortBy] = useState("passRate");
    const [notes, setNotes] = useState({});

    useEffect(() => {
        getTopicStats()
            .then(data => {
                setTopics(data.sort((a, b) => a.passRate - b.passRate));
                setLoading(false);
            });
    }, []);

    function handleRowClick(topic) {
        if (selected === topic.topic) { setSelected(null); setRecs([]); return; }
        setSelected(topic.topic);
        setRecsLoading(true);
        getTopicRecommendations(topic.topic, recsMode).then(data => {
            setRecs(data);
            setRecsLoading(false);
        });
        getTopicNotes(topic.topic).then(n => {
            setNotes(prev => ({ ...prev, [topic.topic]: n }));
        });
    }

    function handleModeSwitch(mode) {
        setRecsMode(mode);
        if (!selected) return;
        setRecsLoading(true);
        getTopicRecommendations(selected, mode).then(data => {
            setRecs(data);
            setRecsLoading(false);
        });
    }

    function sorted() {
        return [...topics].sort((a, b) => {
            if (sortBy === "passRate") return a.passRate - b.passRate;
            if (sortBy === "confidence") return a.avgConfidence - b.avgConfidence;
            if (sortBy === "total") return b.totalProblems - a.totalProblems;
            return 0;
        });
    }

    function weaknessColor(passRate) {
        if (passRate === 0) return "var(--hard)";
        if (passRate < 0.1) return "var(--medium)";
        return "var(--easy)";
    }

    function confidenceBar(avg) {
        const pct = ((avg - 1) / 4) * 100;
        return (
            <div className="conf-bar-track">
                <div className="conf-bar-fill" style={{ width: `${pct}%` }} />
                <span className="conf-bar-label">{avg === 2.5 ? "—" : avg.toFixed(1)}</span>
            </div>
        );
    }

    if (loading) return (
        <div className="loading"><div className="spinner" />Loading topics...</div>
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Topic Analytics</h1>
                    <p className="page-subtitle">{topics.length} topics · sorted by weakness</p>
                </div>
                <div className="sort-controls">
                    <span className="sort-label">Sort by</span>
                    {[["passRate", "Pass Rate"], ["confidence", "Confidence"], ["total", "Total"]].map(([key, label]) => (
                        <button
                            key={key}
                            className={`filter-btn ${sortBy === key ? "active" : ""}`}
                            onClick={() => setSortBy(key)}
                        >{label}</button>
                    ))}
                </div>
            </div>

            <div className="topics-table">
                <div className="topics-table-header">
                    <span>Topic</span>
                    <span>Total</span>
                    <span>Solved</span>
                    <span>Pass Rate</span>
                    <span>Avg Confidence</span>
                </div>

                {sorted().map((t, i) => (
                    <div key={t.topic}>
                        <div
                            className={`topics-row ${selected === t.topic ? "topics-row-active" : ""}`}
                            onClick={() => handleRowClick(t)}
                            style={{ animationDelay: `${i * 30}ms` }}
                        >
                            <span className="topics-name">{t.topic}</span>
                            <span className="topics-cell">{t.totalProblems}</span>
                            <span className="topics-cell">{t.solvedProblems}</span>
                            <span className="topics-passrate" style={{ color: weaknessColor(t.passRate) }}>
                {t.totalProblems === 0 ? "—" : `${(t.passRate * 100).toFixed(2)}%`}
              </span>
                            <span className="topics-cell topics-conf">{confidenceBar(t.avgConfidence)}</span>
                        </div>

                        {selected === t.topic && (
                            <div className="topics-drawer">
                                <div className="drawer-header">
                                    <span className="drawer-title">Recommendations for {t.topic}</span>
                                    <div className="drawer-mode-btns">
                                        {["discover", "review"].map(m => (
                                            <button
                                                key={m}
                                                className={`filter-btn ${recsMode === m ? "active" : ""}`}
                                                onClick={e => { e.stopPropagation(); handleModeSwitch(m); }}
                                            >{m}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className="topic-notes-section">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Add notes for this topic..."
                                        value={notes[selected] || ""}
                                        onChange={e => setNotes(prev => ({ ...prev, [selected]: e.target.value }))}
                                        onBlur={() => updateTopicNotes(selected, notes[selected] || "")}
                                        rows={3}
                                    />
                                    <span className="notes-hint">Auto-saves when you click away</span>
                                </div>

                                {recsLoading
                                    ? <div className="loading"><div className="spinner" />Loading...</div>
                                    : recs.length === 0
                                        ? <div className="empty" style={{ padding: "20px" }}>No recommendations for this topic yet.</div>
                                        : recs.map(p => (
                                            <div key={p.id} className="problem-row" style={{ marginBottom: 6 }}>
                                                <span className="problem-num">#{p.leetcodeId}</span>
                                                <span className="problem-title">{p.title}</span>
                                                <span className={`diff-badge diff-${p.difficulty}`}>{p.difficulty}</span>
                                                {p.url && (
                                                    <a href={p.url} target="_blank" rel="noreferrer" className="problem-link"
                                                       onClick={e => e.stopPropagation()}>↗</a>
                                                )}
                                            </div>
                                        ))
                                }
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}