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
          ? "Semantic Scholar rate limit hit — wait a minute and try again."
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
    if (!confirm("Delete this paper and all its notes/links?")) return;
    try {
      await api.deletePaper(id);
      loadPapers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 760 }}>
      <h1>Library</h1>

      <form onSubmit={handleImport} style={{ marginBottom: "0.75rem" }}>
        <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem", color: "#444" }}>
          Add a paper — paste an arXiv ID/URL, DOI, or a title to search
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={importValue}
            onChange={(e) => setImportValue(e.target.value)}
            placeholder="e.g. 1706.03762, or a paper title"
            style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6 }}
          />
          <button type="submit" disabled={importing} style={buttonStyle}>
            {importing ? "Fetching…" : "Import"}
          </button>
        </div>
      </form>

      <button onClick={() => setShowManualForm((v) => !v)} style={linkButtonStyle}>
        {showManualForm ? "Cancel manual entry" : "Or add manually instead"}
      </button>

      {showManualForm && (
        <form onSubmit={handleManualSubmit} style={{ marginTop: "0.75rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <input
            required
            placeholder="Title"
            value={manual.title}
            onChange={(e) => setManual({ ...manual, title: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Authors"
            value={manual.authors}
            onChange={(e) => setManual({ ...manual, authors: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Abstract"
            value={manual.abstract}
            onChange={(e) => setManual({ ...manual, abstract: e.target.value })}
            style={{ ...inputStyle, minHeight: 70 }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              placeholder="URL"
              value={manual.url}
              onChange={(e) => setManual({ ...manual, url: e.target.value })}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              placeholder="Year"
              value={manual.year}
              onChange={(e) => setManual({ ...manual, year: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <button type="submit" style={buttonStyle}>Add paper</button>
        </form>
      )}

      {error && <p style={{ color: "#dc2626", marginTop: "1rem" }}>{error}</p>}

      <h2 style={{ marginTop: "2rem" }}>Your papers {papers.length > 0 && `(${papers.length})`}</h2>
      {loading && <p>Loading…</p>}
      {!loading && papers.length === 0 && <p style={{ color: "#666" }}>No papers yet — add one above.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {papers.map((p) => (
          <li key={p.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Link to={`/paper/${p.id}`} style={{ fontWeight: 600, color: "#111", textDecoration: "none" }}>
                {p.title}
              </Link>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>
                {p.authors} {p.year ? `· ${p.year}` : ""}
              </div>
            </div>
            <button onClick={() => handleDelete(p.id)} style={dangerLinkStyle}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const inputStyle = { display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.5rem", border: "1px solid #ccc", borderRadius: 6, boxSizing: "border-box" };
const buttonStyle = { padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const linkButtonStyle = { background: "none", border: "none", color: "#2563eb", cursor: "pointer", padding: 0, fontSize: "0.9rem" };
const dangerLinkStyle = { background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem" };