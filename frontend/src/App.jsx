import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Library from "./pages/Library.jsx";
import PaperDetail from "./pages/PaperDetail.jsx";
import Search from "./pages/Search.jsx";
import GraphView from "./pages/GraphView.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/paper/:id" element={<PaperDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/graph" element={<GraphView />} />
      </Routes>
    </BrowserRouter>
  );
}