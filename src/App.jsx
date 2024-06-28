import React from "react";
import Board from "./mod/Board_bot";

const App = () =>{
  return(
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <Board/>
    </div>
  );
};

export default App;