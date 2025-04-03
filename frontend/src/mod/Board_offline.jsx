import React, { useState, useEffect } from "react";
import Square from "../Components/Square";
import Modal from "../Components/Modal";
import { getLineDirection, calculateWinner } from "../utils/gameUtils";

const Board_offline = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [lineDirection, setLineDirection] = useState("");

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i] || gameOver) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[i] = isXNext ? "X" : "O";
    setSquares(newSquares);
    setIsXNext(!isXNext);
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
    setGameOver(false);
    setGameResult("");
    setLineDirection("");
  };

  const checkGameOver = (winner, squares) => {
    if (winner) {
      setGameResult(`Winner: ${winner.player}`);
      setWinningLine(winner.line);
      setGameOver(true);
      setLineDirection(getLineDirection(winner.line));
    } else if (!squares.includes(null)) {
      setGameResult("It's a Draw!");
      setGameOver(true);
    }
  };

  useEffect(() => {
    const winner = calculateWinner(squares);
    checkGameOver(winner, squares);
  }, [squares]);

  let status;
  if (gameOver) {
    status = gameResult;
  } else {
    status = "Next player: " + (isXNext ? "X" : "O");
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-800 to-slate-900 rounded-xl shadow-2xl border border-purple-500/20">
      <div className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{status}</div>
      <div className="grid grid-cols-3 gap-3 px-2">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => handleClick(i)}
            highlight={winningLine.includes(i)}
            lineDirection={lineDirection}
          />
        ))}
      </div>
      <button className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        onClick={handleRestart}>
        Restart Game
      </button>
      {gameOver && <Modal message={gameResult} onClose={handleRestart} button_message={"Play Again"} timer={null} />}
    </div>
  );
};

export default Board_offline;
