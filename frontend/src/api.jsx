const API_BASE = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ? JSON.stringify(body.detail) : `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // Papers
  listPapers: () => request("/papers/"),
  getPaper: (id) => request(`/papers/${id}`),
  createPaper: (data) => request("/papers/", { method: "POST", body: JSON.stringify(data) }),
  importPaper: (identifier) =>
    request("/papers/import", { method: "POST", body: JSON.stringify({ identifier }) }),
  updatePaper: (id, data) => request(`/papers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePaper: (id) => request(`/papers/${id}`, { method: "DELETE" }),

  // Notes
  addNote: (paper_id, content) =>
    request("/notes/", { method: "POST", body: JSON.stringify({ paper_id, content }) }),
  updateNote: (id, content) => request(`/notes/${id}`, { method: "PATCH", body: JSON.stringify({ content }) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: "DELETE" }),

  // Links
  addLink: (data) => request("/links/", { method: "POST", body: JSON.stringify(data) }),
  deleteLink: (id) => request(`/links/${id}`, { method: "DELETE" }),

  // Search
  search: (q) => request(`/search/?q=${encodeURIComponent(q)}`),

  // Graph
  getGraph: () => request("/graph/"),
};

export { API_BASE };