import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Components/Home";
import Board_offline from "./mod/Board_offline";
import Board_bot from "./mod/Board_bot";
import Footer from "./Components/Footer";
import Board_online from "./mod/Board_online";

const App = () => {
  const [mode, setMode] = useState(null);

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-700 to-teal-500">
        <div className="flex-grow flex items-center justify-center">
          <Routes>
            <Route path="/" element={<Home onSelectMode={handleSelectMode} />} />
            <Route path="/offline" element={<Board_offline />} />
            <Route path="/bot" element={<Board_bot />} />
            <Route path="/online" element={<Board_online />} />
          </Routes>
        </div>
        <Footer />
      </div>
      <RedirectOnBack />
    </Router>
  );
};

const RedirectOnBack = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return null;
};

export default App;
