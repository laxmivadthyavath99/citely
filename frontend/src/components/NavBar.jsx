import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    marginRight: "1.75rem",
    textDecoration: "none",
    fontFamily: "var(--font-body)",
    fontSize: "0.92rem",
    fontWeight: pathname === path ? 600 : 400,
    color: pathname === path ? "var(--ink)" : "var(--ink-soft)",
    borderBottom: pathname === path ? "2px solid var(--brass)" : "2px solid transparent",
    paddingBottom: "0.3rem",
  });

  return (
    <nav
      style={{
        padding: "1.1rem 2rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        background: "var(--surface)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "1.25rem",
          marginRight: "2.5rem",
          color: "var(--moss-dark)",
          letterSpacing: "-0.01em",
        }}
      >
        Citely
      </span>
      <Link to="/" style={linkStyle("/")}>Library</Link>
      <Link to="/search" style={linkStyle("/search")}>Search</Link>
      <Link to="/graph" style={linkStyle("/graph")}>Graph</Link>
    </nav>
  );
}