import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function Library() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [importValue, setImportValue] = useState("");
  const [importing, setImporting] = useState(false);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manual, setManual] = useState({ title: "", authors: "", abstract: "", url: "", year: "" });

  function loadPapers() {
    setLoading(true);
    api
      .listPapers()
      .then(setPapers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadPapers, []);

  async function handleImport(e) {
    e.preventDefault();
    if (!importValue.trim()) return;
    setImporting(true);
    setError(null);
    try {
      await api.importPaper(importValue.trim());
      setImportValue("");
      loadPapers();
    } catch (err) {
      setError(
        err.message.includes("429")
          ? "Semantic Scholar's free tier is rate-limited right now — wait a minute and try again."
          : err.message
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    try {
      await api.createPaper({
        title: manual.title,
        authors: manual.authors,
        abstract: manual.abstract,
        url: manual.url || null,
        year: manual.year ? parseInt(manual.year, 10) : null,
        source: "manual",
      });
      setManual({ title: "", authors: "", abstract: "", url: "", year: "" });
      setShowManualForm(false);
      loadPapers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this paper and all its notes and links?")) return;
    try {
      await api.deletePaper(id);
      loadPapers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 2rem" }}>
      <h1>Library</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: "-0.25rem" }}>
        Every paper you've read, what you learned from it, and how it connects to the rest.
      </p>

      <form onSubmit={handleImport} style={{ marginTop: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", color: "var(--ink-soft)" }}>
          Paste an arXiv ID, arXiv URL, DOI, or a title to search
        </label>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <input
            className="input"
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            placeholder="e.g. 1706.03762"
          />
          <button type="submit" disabled={importing} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            {importing ? "Fetching…" : "Add paper"}
          </button>
        </div>
      </form>

      <button onClick={() => setShowManualForm((v) => !v)} className="btn-text" style={{ marginTop: "0.75rem" }}>
        {showManualForm ? "Cancel manual entry" : "Enter details manually instead"}
      </button>

      {showManualForm && (
        <form
          onSubmit={handleManualSubmit}
          className="card"
          style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          <input
            required
            className="input"
            placeholder="Title"
            value={manual.title}
            onChange={(e) => setManual({ ...manual, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="Authors"
            value={manual.authors}
            onChange={(e) => setManual({ ...manual, authors: e.target.value })}
          />
          <textarea
            className="input"
            placeholder="Abstract"
            value={manual.abstract}
            onChange={(e) => setManual({ ...manual, abstract: e.target.value })}
            style={{ minHeight: 80, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <input
              className="input"
              placeholder="URL"
              value={manual.url}
              onChange={(e) => setManual({ ...manual, url: e.target.value })}
              style={{ flex: 2 }}
            />
            <input
              className="input"
              placeholder="Year"
              value={manual.year}
              onChange={(e) => setManual({ ...manual, year: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
            Add paper
          </button>
        </form>
      )}

      {error && (
        <p style={{ color: "var(--brick)", marginTop: "1rem", fontSize: "0.9rem" }}>{error}</p>
      )}

      <h2>
        Your papers{papers.length > 0 && <span className="meta"> — {papers.length}</span>}
      </h2>

      {loading && <p style={{ color: "var(--ink-soft)" }}>Loading…</p>}
      {!loading && papers.length === 0 && (
        <p style={{ color: "var(--ink-soft)" }}>Nothing here yet — add your first paper above.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {papers.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ minWidth: 0 }}>
                <Link
                  to={`/paper/${p.id}`}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    color: "var(--ink)",
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  {p.title}
                </Link>
                <div className="meta" style={{ marginTop: "0.3rem" }}>
                  {p.authors || "Unknown authors"} {p.year ? `· ${p.year}` : ""}
                </div>
              </div>
              <button onClick={() => handleDelete(p.id)} className="btn-danger-text">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}