const BASE = 'https://codequeue-production.up.railway.app';

export async function getProblems() {
    const r = await fetch(`${BASE}/problems`);
    return r.json();
}

export async function getDiscoverQueue() {
    const r = await fetch(`${BASE}/recommendations/discover`);
    return r.json();
}

export async function getReviewQueue() {
    const r = await fetch(`${BASE}/recommendations/review`);
    return r.json();
}

export async function getAttempts(problemId) {
    const r = await fetch(`${BASE}/attempts/${problemId}`);
    return r.json();
}

export async function logAttempt(problemId, attempt) {
    const r = await fetch(`${BASE}/attempts/${problemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
    });
    return r.json();
}

export async function updateAttempt(id, attempt) {
    const r = await fetch(`${BASE}/attempts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attempt),
    });
    return r.json();
}

export async function deleteAttempt(id) {
    await fetch(`${BASE}/attempts/${id}`, { method: 'DELETE' });
}

export async function toggleFlag(attemptId) {
    const r = await fetch(`${BASE}/attempts/${attemptId}/flag`, { method: 'PUT' });
    return r.json();
}

export async function updateNotes(attemptId, notes) {
    const r = await fetch(`${BASE}/attempts/${attemptId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes),
    });
    return r.json();
}


export const getTopicStats = () =>
    fetch(`${BASE}/topics`).then(res => res.json());

export const getTopicRecommendations = (topic, mode) =>
    fetch(`${BASE}/topics/${encodeURIComponent(topic)}/recommendations?mode=${mode}`).then(res => res.json());

export const getTopicNotes = (topic) =>
    fetch(`${BASE}/topics/${encodeURIComponent(topic)}/notes`).then(res => res.text());

export const updateTopicNotes = (topic, notes) =>
    fetch(`${BASE}/topics/${encodeURIComponent(topic)}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes)
    }).then(res => res.json());

export const saveMockInterview = (session) =>
    fetch(`${BASE}/mock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
    }).then(res => res.json());

export const getMockInterviews = () =>
    fetch(`${BASE}/mock`).then(res => res.json());

export const deleteMockInterview = (id) =>
    fetch(`${BASE}/mock/${id}`, { method: 'DELETE' });