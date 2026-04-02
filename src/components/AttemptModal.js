import { useState } from "react";

export default function AttemptModal({ problem, onClose, onSubmit }) {
    const [result, setResult] = useState("PASS");
    const [confidence, setConfidence] = useState(3);
    const [notes, setNotes] = useState("");
    const [flaggedForReview, setFlaggedForReview] = useState(false);
    const [timeSpentMinutes, setTimeSpentMinutes] = useState("");

    function handleSubmit() {
        onSubmit({ result, confidence, notes, flaggedForReview, timeSpentMinutes: parseInt(timeSpentMinutes) || null });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Log Attempt</h2>
                <p className="modal-subtitle">{problem.title}</p>

                <div className="modal-field">
                    <label className="form-label">Result</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["FAIL", "PASS", "EASY"].map(r => (
                            <button
                                key={r}
                                className={`rating-btn ${result === r ? "selected" : ""}`}
                                style={{ color: result === r ? "var(--accent)" : "var(--muted)" }}
                                onClick={() => setResult(r)}
                            >{r}</button>
                        ))}
                    </div>
                </div>

                <div className="modal-field">
                    <label className="form-label">Confidence (1–5)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                className={`rating-btn ${confidence === n ? "selected" : ""}`}
                                onClick={() => setConfidence(n)}
                            >{n}</button>
                        ))}
                    </div>
                </div>

                <div className="modal-field">
                    <label className="form-label">Time Spent (minutes)</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="e.g. 25"
                        value={timeSpentMinutes}
                        onChange={e => setTimeSpentMinutes(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="modal-field">
                    <label className="form-label">Notes</label>
                    <textarea
                        placeholder="Key insight, mistake, pattern..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="form-textarea"
                        rows={3}
                    />
                </div>

                <div className="modal-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <label className="form-label" style={{ margin: 0 }}>Flag for Review</label>
                    <input
                        type="checkbox"
                        checked={flaggedForReview}
                        onChange={e => setFlaggedForReview(e.target.checked)}
                    />
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
}