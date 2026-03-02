import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Portfolio from "./pages/Portfolio";
import Sessions from "./pages/Sessions";
import Playground from "./pages/Playground";
import Login from "./pages/Login";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/login" element={<Login />} />
          <Route path="/session/new" element={<Playground />} />
          <Route path="/session/:id" element={<Playground />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
