import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

const WIDTH = 800;
const HEIGHT = 560;

const RELATION_COLORS = {
  builds_on: "#3D5A4C",
  contradicts: "#A23B3B",
  same_method: "#9C7A3C",
  related: "#A6A198",
};

function useForceLayout(nodes, edges) {
  const [positions, setPositions] = useState({});
  const posRef = useRef({});
  const velRef = useRef({});

  useEffect(() => {
    if (nodes.length === 0) return;

    nodes.forEach((n, i) => {
      if (!posRef.current[n.id]) {
        const angle = (i / nodes.length) * 2 * Math.PI;
        posRef.current[n.id] = {
          x: WIDTH / 2 + 200 * Math.cos(angle),
          y: HEIGHT / 2 + 200 * Math.sin(angle),
        };
        velRef.current[n.id] = { x: 0, y: 0 };
      }
    });

    let frame;
    let ticks = 0;
    const MAX_TICKS = 300;

    function tick() {
      const pos = posRef.current;
      const vel = velRef.current;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i].id, b = nodes[j].id;
          const dx = pos[a].x - pos[b].x;
          const dy = pos[a].y - pos[b].y;
          const distSq = Math.max(dx * dx + dy * dy, 1);
          const force = 4000 / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          vel[a].x += fx; vel[a].y += fy;
          vel[b].x -= fx; vel[b].y -= fy;
        }
      }

      edges.forEach((e) => {
        const a = pos[e.source], b = pos[e.target];
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const targetDist = 160;
        const force = (dist - targetDist) * 0.02;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        vel[e.source].x += fx; vel[e.source].y += fy;
        vel[e.target].x -= fx; vel[e.target].y -= fy;
      });

      nodes.forEach((n) => {
        const p = pos[n.id], v = vel[n.id];
        v.x += (WIDTH / 2 - p.x) * 0.001;
        v.y += (HEIGHT / 2 - p.y) * 0.001;
        v.x *= 0.85; v.y *= 0.85;
        p.x += v.x; p.y += v.y;
        p.x = Math.max(40, Math.min(WIDTH - 40, p.x));
        p.y = Math.max(40, Math.min(HEIGHT - 40, p.y));
      });

      ticks += 1;
      setPositions({ ...pos });
      if (ticks < MAX_TICKS) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [nodes, edges]);

  return positions;
}

export default function GraphView() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [error, setError] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    api
      .getGraph()
      .then(setGraph)
      .catch(() => setError("Could not reach backend — is uvicorn running on :8000?"));
  }, []);

  const positions = useForceLayout(graph.nodes, graph.edges);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2.5rem 2rem" }}>
      <h1>Paper graph</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: "-0.25rem" }}>
        How your papers connect — hover a card to see its title.
      </p>
      {error && <p style={{ color: "var(--brick)" }}>{error}</p>}

      {graph.nodes.length === 0 && !error && (
        <p style={{ color: "var(--ink-soft)" }}>
          No papers yet. Add some from the library, then link them to see the graph.
        </p>
      )}

      <div style={{ display: "flex", gap: "1.25rem", margin: "1rem 0", fontSize: "0.8rem" }}>
        {Object.entries(RELATION_COLORS).map(([type, color]) => (
          <span key={type} style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--ink-soft)" }}>
            <span style={{ width: 10, height: 10, background: color, display: "inline-block", borderRadius: "50%" }} />
            {type.replace("_", " ")}
          </span>
        ))}
      </div>

      <svg width={WIDTH} height={HEIGHT} style={{ border: "1px solid var(--border)", borderRadius: 8, background: "#fff" }}>
        {graph.edges.map((e) => {
          const a = positions[e.source], b = positions[e.target];
          if (!a || !b) return null;
          return (
            <line
              key={e.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={RELATION_COLORS[e.relation_type] || "#999"}
              strokeWidth={2}
              opacity={0.7}
            />
          );
        })}

        {graph.nodes.map((n) => {
          const p = positions[n.id];
          if (!p) return null;
          const isHovered = hoveredNode === n.id;
          return (
            <g key={n.id} onMouseEnter={() => setHoveredNode(n.id)} onMouseLeave={() => setHoveredNode(null)}>
              <circle cx={p.x} cy={p.y} r={isHovered ? 14 : 10} fill="#3D5A4C" stroke="#9C7A3C" strokeWidth={1.5} />
              <text x={p.x + 16} y={p.y + 4} fontSize={12} fill="var(--ink)">
                {n.title.length > 40 ? n.title.slice(0, 40) + "…" : n.title}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="meta" style={{ marginTop: "0.5rem" }}>
        {graph.nodes.length} papers · {graph.edges.length} links
      </p>
    </div>
  );
}