import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

const RELATION_TYPES = ["builds_on", "contradicts", "same_method", "related"];

export default function PaperDetail() {
  const { id } = useParams();
  const paperId = parseInt(id, 10);

  const [paper, setPaper] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [error, setError] = useState(null);

  const [noteText, setNoteText] = useState("");
  const [linkTarget, setLinkTarget] = useState("");
  const [linkType, setLinkType] = useState(RELATION_TYPES[0]);
  const [linkDesc, setLinkDesc] = useState("");

  function load() {
    api.getPaper(paperId).then(setPaper).catch((e) => setError(e.message));
    api.listPapers().then(setAllPapers).catch(() => {});
  }

  useEffect(load, [paperId]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.addNote(paperId, noteText.trim());
      setNoteText("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await api.deleteNote(noteId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddLink(e) {
    e.preventDefault();
    if (!linkTarget) return;
    try {
      await api.addLink({
        from_paper_id: paperId,
        to_paper_id: parseInt(linkTarget, 10),
        relation_type: linkType,
        description: linkDesc,
      });
      setLinkTarget("");
      setLinkDesc("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteLink(linkId) {
    try {
      await api.deleteLink(linkId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <p style={{ color: "var(--brick)" }}>{error}</p>
      </div>
    );
  }
  if (!paper) {
    return (
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <p style={{ color: "var(--ink-soft)" }}>Loading…</p>
      </div>
    );
  }

  const otherPapers = allPapers.filter((p) => p.id !== paperId);
  const allLinks = [...paper.links_from, ...paper.links_to];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 2rem" }}>
      <Link to="/" className="btn-text" style={{ fontSize: "0.85rem" }}>&larr; Back to library</Link>

      <h1 style={{ marginTop: "1rem" }}>{paper.title}</h1>
      <div className="meta">
        {paper.authors || "Unknown authors"} {paper.year ? `· ${paper.year}` : ""}
      </div>
      {paper.url && (
        <p style={{ marginTop: "0.5rem" }}>
          <a href={paper.url} target="_blank" rel="noreferrer">{paper.url}</a>
        </p>
      )}
      {paper.abstract && (
        <p style={{ marginTop: "1rem", color: "var(--ink-soft)", lineHeight: 1.65 }}>{paper.abstract}</p>
      )}

      <h2>Notes</h2>
      <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", marginTop: "-0.5rem" }}>
        What did you actually take away from this paper?
      </p>
      <form onSubmit={handleAddNote} style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", marginBottom: "1rem" }}>
        <textarea
          className="input"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a note…"
          style={{ minHeight: 64, resize: "vertical" }}
        />
        <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Add</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {paper.notes.map((n) => (
          <div key={n.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
            <span style={{ lineHeight: 1.55 }}>{n.content}</span>
            <button onClick={() => handleDeleteNote(n.id)} className="btn-danger-text" style={{ flexShrink: 0 }}>
              Delete
            </button>
          </div>
        ))}
        {paper.notes.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No notes yet.</p>}
      </div>

      <h2>Links to other papers</h2>
      <form
        onSubmit={handleAddLink}
        style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem", marginBottom: "1rem", alignItems: "center" }}
      >
        <select className="input" value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)} style={{ width: "auto", flex: "1 1 200px" }}>
          <option value="">Link to…</option>
          {otherPapers.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select className="input" value={linkType} onChange={(e) => setLinkType(e.target.value)} style={{ width: "auto", flex: "0 0 auto" }}>
          {RELATION_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
        <input
          className="input"
          placeholder="Why? (optional)"
          value={linkDesc}
          onChange={(e) => setLinkDesc(e.target.value)}
          style={{ flex: "1 1 200px" }}
        />
        <button type="submit" className="btn btn-primary">Link</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {allLinks.map((l) => {
          const otherId = l.from_paper_id === paperId ? l.to_paper_id : l.from_paper_id;
          const other = allPapers.find((p) => p.id === otherId);
          const direction = l.from_paper_id === paperId ? "→" : "←";
          return (
            <div key={l.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span>
                <span className="tag">{l.relation_type.replace("_", " ")}</span>
                {" "}{direction}{" "}
                {other ? <Link to={`/paper/${other.id}`}>{other.title}</Link> : `paper #${otherId}`}
                {l.description && <span style={{ color: "var(--ink-soft)" }}> — {l.description}</span>}
              </span>
              <button onClick={() => handleDeleteLink(l.id)} className="btn-danger-text" style={{ flexShrink: 0 }}>
                Remove
              </button>
            </div>
          );
        })}
        {allLinks.length === 0 && <p style={{ color: "var(--ink-soft)" }}>No links yet.</p>}
      </div>
    </div>
  );
}