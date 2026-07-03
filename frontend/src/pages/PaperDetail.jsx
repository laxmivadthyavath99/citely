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

  if (error) return <div style={{ padding: "2rem" }}><p style={{ color: "#dc2626" }}>{error}</p></div>;
  if (!paper) return <div style={{ padding: "2rem" }}>Loading…</div>;

  const otherPapers = allPapers.filter((p) => p.id !== paperId);
  const allLinks = [...paper.links_from, ...paper.links_to];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 760 }}>
      <p><Link to="/">&larr; Back to library</Link></p>

      <h1>{paper.title}</h1>
      <p style={{ color: "#666" }}>{paper.authors} {paper.year ? `· ${paper.year}` : ""}</p>
      {paper.url && <p><a href={paper.url} target="_blank" rel="noreferrer">{paper.url}</a></p>}
      {paper.abstract && <p style={{ lineHeight: 1.5 }}>{paper.abstract}</p>}

      <h2 style={{ marginTop: "2rem" }}>Notes</h2>
      <form onSubmit={handleAddNote} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="What did you actually learn from this paper?"
          style={{ flex: 1, padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6, minHeight: 60 }}
        />
        <button type="submit" style={buttonStyle}>Add</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {paper.notes.map((n) => (
          <li key={n.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
            <span>{n.content}</span>
            <button onClick={() => handleDeleteNote(n.id)} style={dangerLinkStyle}>Delete</button>
          </li>
        ))}
        {paper.notes.length === 0 && <p style={{ color: "#666" }}>No notes yet.</p>}
      </ul>

      <h2 style={{ marginTop: "2rem" }}>Links to other papers</h2>
      <form onSubmit={handleAddLink} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        <select value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)} style={selectStyle}>
          <option value="">Link to…</option>
          {otherPapers.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select value={linkType} onChange={(e) => setLinkType(e.target.value)} style={selectStyle}>
          {RELATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          placeholder="Why? (optional)"
          value={linkDesc}
          onChange={(e) => setLinkDesc(e.target.value)}
          style={{ flex: 1, minWidth: 160, padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6 }}
        />
        <button type="submit" style={buttonStyle}>Link</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {allLinks.map((l) => {
          const otherId = l.from_paper_id === paperId ? l.to_paper_id : l.from_paper_id;
          const other = allPapers.find((p) => p.id === otherId);
          const direction = l.from_paper_id === paperId ? "→" : "←";
          return (
            <li key={l.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
              <span>
                <strong>{l.relation_type}</strong> {direction}{" "}
                {other ? <Link to={`/paper/${other.id}`}>{other.title}</Link> : `paper #${otherId}`}
                {l.description && <span style={{ color: "#666" }}> — {l.description}</span>}
              </span>
              <button onClick={() => handleDeleteLink(l.id)} style={dangerLinkStyle}>Remove</button>
            </li>
          );
        })}
        {allLinks.length === 0 && <p style={{ color: "#666" }}>No links yet.</p>}
      </ul>
    </div>
  );
}

const buttonStyle = { padding: "0.5rem 1rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const dangerLinkStyle = { background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem" };
const selectStyle = { padding: "0.5rem", border: "1px solid #ccc", borderRadius: 6 };