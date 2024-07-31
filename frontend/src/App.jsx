import React, { useState } from "react";
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
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-700 to-teal-500">
      <div className="flex-grow flex items-center justify-center">
        {!mode && <Home onSelectMode={handleSelectMode} />}
        {mode === "offline" && <Board_offline />}
        {mode === "bot" && <Board_bot />}
        {mode === "online" && <Board_online />}
      </div>
      <Footer />
    </div>
  );
};

export default App;
