import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./Components/Home";
import Board_offline from "./mod/Board_offline";
import Board_bot from "./mod/Board_bot";
import Board_online from "./mod/Board_online";
import Navbar from "./Components/Navbar";

const App = () => {
  const [mode, setMode] = useState(null);

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-16">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home onSelectMode={handleSelectMode} />} />
              <Route path="/offline" element={<Board_offline />} />
              <Route path="/bot" element={<Board_bot />} />
              <Route path="/online" element={<Board_online />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      <RedirectOnBack />
      <RoomRedirect />
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


const RoomRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam && location.pathname === '/') {
      navigate('/online', { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default App;
