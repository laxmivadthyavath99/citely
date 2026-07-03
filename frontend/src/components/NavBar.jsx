import { Link, useLocation } from "react-router-dom";

const linkStyle = (active) => ({
  marginRight: "1.25rem",
  textDecoration: "none",
  color: active ? "#111" : "#2563eb",
  fontWeight: active ? 600 : 400,
});

export default function NavBar() {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  return (
    <nav style={{ padding: "1rem 2rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>
      <span style={{ fontWeight: 700, marginRight: "2rem" }}>Citely</span>
      <Link to="/" style={linkStyle(isActive("/"))}>Library</Link>
      <Link to="/search" style={linkStyle(isActive("/search"))}>Search</Link>
      <Link to="/graph" style={linkStyle(isActive("/graph"))}>Graph</Link>
    </nav>
  );
}