import React, { useState, useEffect } from "react";
import Square from "../Components/Square";
import Modal from "../Components/Modal";

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

  const getLineDirection = (line) => {
    if (line[0] % 3 === line[2] % 3) {
      return "vertical";
    } else if (Math.floor(line[0] / 3) === Math.floor(line[2] / 3)) {
      return "horizontal";
    } else if (line.includes(0) && line.includes(4) && line.includes(8)) {
      return "diagonal-left";
    } else if (line.includes(2) && line.includes(4) && line.includes(6)) {
      return "diagonal-right";
    }
    return "";
  };

  let status;
  if (gameOver) {
    status = gameResult;
  } else {
    status = "Next player: " + (isXNext ? "X" : "O");
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-200 to-purple-300 rounded-lg shadow-2xl transition-transform duration-500 ease-in-out transform hover:scale-105">
      <div className="text-2xl font-bold mb-4 text-blue-700">{status}</div>
      <div className="grid grid-cols-3 gap-2">
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
      <button
        className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110"
        onClick={handleRestart}
      >
        Restart Game
      </button>
      {gameOver && <Modal message={gameResult} onClose={handleRestart} />}
    </div>
  );
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
};

export default Board_offline;
