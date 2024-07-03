import React, { useState } from "react";
import Home from "./Components/Home";
import Board_offline from "./mod/Board_offline";
import Board_bot from "./mod/Board_bot";
import Footer from "./Components/Footer";

const App = () => {
  const [mode, setMode] = useState(null);

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="flex-grow flex items-center justify-center">
        {!mode && <Home onSelectMode={handleSelectMode} />}
        {mode === "offline" && <Board_offline />}
        {mode === "bot" && <Board_bot />}
      </div>
      <Footer />
    </div>
  );
};

export default App;
