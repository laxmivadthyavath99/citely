import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const FIELD_LABELS = {
  title: "Title",
  authors: "Authors",
  abstract: "Abstract",
  note: "Note",
};

export default function Search() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!q.trim()) return;
    try {
      const res = await api.search(q.trim());
      setResults(res);
      setSearched(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 760 }}>
      <h1>Search</h1>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, authors, abstracts, and your notes"
          style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button type="submit" style={buttonStyle}>Search</button>
      </form>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}

      {searched && results.length === 0 && !error && <p style={{ color: "#666" }}>No matches found.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {results.map((r, i) => (
          <li key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}>
            <Link to={`/paper/${r.paper_id}`} style={{ fontWeight: 600, color: "#111", textDecoration: "none" }}>
              {r.title}
            </Link>
            <div style={{ fontSize: "0.85rem", color: "#666" }}>
              matched in <strong>{FIELD_LABELS[r.matched_field] || r.matched_field}</strong>
            </div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>{r.snippet}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const buttonStyle = { padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };