import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import GraphView from "./pages/GraphView.jsx";

const API_BASE = "http://localhost:8000";

function HomePage() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status === "ok" ? "connected" : "unknown"))
      .catch(() => setStatus("backend not reachable — is uvicorn running on :8000?"));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 640 }}>
      <h1>Citely</h1>
      <p>A connected knowledge base for the papers you read.</p>
      <p>
        Backend status: <strong>{status}</strong>
      </p>
      <p>
        <Link to="/graph">View paper graph &rarr;</Link>
      </p>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Core CRUD, search, and metadata import are live via the API — full library UI lands in a later phase.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphView />} />
      </Routes>
    </BrowserRouter>
  );
}