import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import { Portfolio } from "./pages";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Portfolio />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
