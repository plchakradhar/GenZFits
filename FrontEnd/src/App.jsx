import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage";
import AdminPage from "./pages/adminpage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page will also handle login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/adminpage" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
