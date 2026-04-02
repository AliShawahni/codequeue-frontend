import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { saveMockInterview, getMockInterviews, deleteMockInterview } from "../api";

const STARTER_CODE = `import java.util.Arrays;

class Main {
    // Write your solution here
    public static void solve() {
        
    }

    public static void main(String[] args) {
        // Test your solution here
        // e.g. System.out.println(solve(5));
    }
}`;

export default function MockInterview() {
    const [tab, setTab] = useState("interview");
    const [problem, setProblem] = useState("");
    const [code, setCode] = useState(STARTER_CODE);
    const [language, setLanguage] = useState("java");
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [timerOn, setTimerOn] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [expandedSession, setExpandedSession] = useState(null);
    const [showSubmit, setShowSubmit] = useState(false);
    const [submitResult, setSubmitResult] = useState("PASS");
    const [submitNotes, setSubmitNotes] = useState("");
    const [leftWidth, setLeftWidth] = useState(40);
    const intervalRef = useRef(null);
    const dragging = useRef(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (tab === "sessions") loadSessions();
    }, [tab]);

    useEffect(() => {
        if (timerOn) {
            intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [timerOn]);

    const onMouseMove = useCallback((e) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        if (pct > 20 && pct < 80) setLeftWidth(pct);
    }, []);

    const onMouseUp = useCallback(() => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, []);

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    function startDrag() {
        dragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    }

    function loadSessions() {
        getMockInterviews().then(setSessions);
    }

    function formatTime(s) {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    }

    function resetTimer() {
        setTimerOn(false);
        setElapsed(0);
    }

    async function runCode() {
        if (!code.trim()) return;
        setRunning(true);
        setOutput(null);
        try {
            const JUDGE0_URL = "https://ce.judge0.com";
            const LANG_ID = language === "java" ? 62 : language === "python" ? 71 : 63;
            const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ source_code: code, language_id: LANG_ID, stdin: "" })
            });
            const result = await submitRes.json();
            setOutput(result);
        } catch (e) {
            setOutput({ stderr: "Failed to connect to Judge0." });
        }
        setRunning(false);
    }

    async function handleSubmit() {
        await saveMockInterview({
            problem, code, language,
            result: submitResult,
            notes: submitNotes,
            timeSpentSeconds: elapsed
        });
        setShowSubmit(false);
        setSubmitNotes("");
        setTab("sessions");
    }

    async function handleDelete(id) {
        await deleteMockInterview(id);
        loadSessions();
    }

    function outputText() {
        if (!output) return null;
        if (output.compile_output) return { text: output.compile_output, type: "error" };
        if (output.stderr) return { text: output.stderr, type: "error" };
        if (output.stdout) return { text: output.stdout, type: "success" };
        return { text: output.status?.description || "No output", type: "muted" };
    }

    const out = outputText();

    return (
        <div>
            <div className="page-header" style={{ marginBottom: 12, paddingBottom: 12 }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: "20px", marginBottom: 2 }}>Mock Interview</h1>
                    <p className="page-subtitle" style={{ fontSize: "12px" }}>Simulate real interview conditions</p>
                </div>
                <div className="sort-controls">
                    {[["interview", "⌨ New Session"], ["sessions", "📋 Past Sessions"]].map(([id, label]) => (
                        <button key={id} className={`filter-btn ${tab === id ? "active" : ""}`}
                                onClick={() => setTab(id)}>{label}</button>
                    ))}
                </div>
            </div>

            {tab === "interview" && (
                <div ref={containerRef} style={{ display: "flex", height: "calc(100vh - 120px)", gap: 0 }}>
                    {/* LEFT */}
                    <div style={{ width: `${leftWidth}%`, display: "flex", flexDirection: "column", overflowY: "auto", paddingRight: 8 }}>
                        <div className="mock-section-label">Problem Statement</div>
                        <textarea
                            className="form-textarea mock-problem-input"
                            placeholder="Paste the problem statement here..."
                            value={problem}
                            onChange={e => setProblem(e.target.value)}
                            style={{ flex: 1, resize: "none" }}
                        />
                        {out && (
                            <div className={`mock-output mock-output-${out.type}`} style={{ marginTop: 16 }}>
                                <div className="mock-output-label">Output</div>
                                <pre className="mock-output-text">{out.text}</pre>
                            </div>
                        )}
                        {running && (
                            <div className="loading" style={{ padding: "16px 0" }}>
                                <div className="spinner" />Running...
                            </div>
                        )}
                    </div>

                    {/* DIVIDER */}
                    <div
                        onMouseDown={startDrag}
                        style={{
                            width: 6,
                            cursor: "col-resize",
                            background: "var(--border)",
                            borderRadius: 3,
                            margin: "0 6px",
                            flexShrink: 0,
                            transition: "background 0.15s"
                        }}
                        onMouseEnter={e => e.target.style.background = "var(--accent)"}
                        onMouseLeave={e => e.target.style.background = "var(--border)"}
                    />

                    {/* RIGHT */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <div className="mock-timer-bar">
                            <div className={`mock-timer-display ${timerOn ? "mock-timer-running" : ""}`}>
                                {formatTime(elapsed)}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="timer-btn timer-btn-start" onClick={() => setTimerOn(t => !t)}>
                                    {timerOn ? "⏸ Pause" : "▶ Start"}
                                </button>
                                <button className="timer-btn timer-btn-reset" onClick={resetTimer}>↺</button>
                            </div>
                            <select className="mock-lang-select" value={language}
                                    onChange={e => setLanguage(e.target.value)}>
                                <option value="java">Java</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                        </div>
                        <div className="mock-editor-wrap" style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                language={language}
                                value={code}
                                onChange={val => setCode(val || "")}
                                theme="vs-dark"
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontFamily: "'Space Mono', monospace",
                                    lineNumbers: "on",
                                    automaticLayout: true,
                                    smoothScrolling: true,
                                    renderWhitespace: "none",
                                    quickSuggestions: false,
                                    suggestOnTriggerCharacters: false,
                                    wordBasedSuggestions: "off",
                                }}
                            />
                        </div>
                        <div className="mock-actions">
                            <button className="btn btn-secondary" onClick={runCode} disabled={running}>
                                {running ? "Running..." : "▶ Run Code"}
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowSubmit(true)}>
                                ✓ Submit Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tab === "sessions" && (
                <div>
                    {sessions.length === 0
                        ? <div className="empty">No sessions yet. Complete a mock interview first.</div>
                        : sessions.map(s => (
                            <div key={s.id} className="mock-session-row">
                                <div className="mock-session-header"
                                     onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}>
                                    <div>
                                        <span className="mock-session-problem">
                                            {s.problem?.slice(0, 60) || "Untitled"}{s.problem?.length > 60 ? "..." : ""}
                                        </span>
                                        <span className="mock-session-meta">
                                            {s.date} · {formatTime(s.timeSpentSeconds)} · {s.language}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <span className={`result-${s.result}`}>{s.result}</span>
                                        <button className="btn btn-secondary"
                                                style={{ padding: "4px 10px", fontSize: 12 }}
                                                onClick={e => { e.stopPropagation(); handleDelete(s.id); }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {expandedSession === s.id && (
                                    <div className="mock-session-expanded">
                                        {s.notes && <p className="mock-session-notes">{s.notes}</p>}
                                        <Editor
                                            height="300px"
                                            language={s.language}
                                            value={s.code}
                                            theme="vs-dark"
                                            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13 }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>
            )}

            {showSubmit && (
                <div className="modal-overlay" onClick={() => setShowSubmit(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Submit Session</h2>
                        <p className="modal-subtitle">Time: {formatTime(elapsed)}</p>
                        <div className="modal-field">
                            <label className="form-label">Result</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                {["PASS", "FAIL"].map(r => (
                                    <button key={r} className={`rating-btn ${submitResult === r ? "selected" : ""}`}
                                            onClick={() => setSubmitResult(r)}>{r}</button>
                                ))}
                            </div>
                        </div>
                        <div className="modal-field">
                            <label className="form-label">Notes</label>
                            <textarea className="form-textarea" rows={3}
                                      placeholder="What did you learn? What went wrong?"
                                      value={submitNotes}
                                      onChange={e => setSubmitNotes(e.target.value)} />
                        </div>
                        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                            <button className="btn btn-secondary" onClick={() => setShowSubmit(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save Session</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}