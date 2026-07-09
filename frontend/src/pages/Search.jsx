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
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 2rem" }}>
      <h1>Search</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: "-0.25rem" }}>
        Across titles, authors, abstracts, and everything you've written in your notes.
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.6rem", marginTop: "1.25rem", marginBottom: "1.5rem" }}>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your library…"
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <p style={{ color: "var(--brick)" }}>{error}</p>}
      {searched && results.length === 0 && !error && (
        <p style={{ color: "var(--ink-soft)" }}>No matches found.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {results.map((r, i) => (
          <Link key={i} to={`/paper/${r.paper_id}`} style={{ textDecoration: "none" }}>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--ink)" }}>
                  {r.title}
                </span>
                <span className="tag">{FIELD_LABELS[r.matched_field] || r.matched_field}</span>
              </div>
              <div style={{ marginTop: "0.4rem", color: "var(--ink-soft)", fontSize: "0.92rem" }}>
                {r.snippet}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}