import React, { useState, useEffect } from "react";
import Square from "../Components/Square";
import Modal from "../Components/Modal";
import { calculateWinner, getBotMove, getLineDirection } from "../utils/gameUtils";

const BoardBot = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [lineDirection, setLineDirection] = useState("");

  useEffect(() => {
    if (!isXNext && !gameOver) {
      setTimeout(fetchBotMove, 1000);
    }
  }, [isXNext]);

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i] || !isXNext || gameOver) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[i] = "X";
    setSquares(newSquares);
    setIsXNext(false);
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
    setGameOver(false);
    setGameResult("");
    setLineDirection("");
  };

  const fetchBotMove = () => {
    const move = getBotMove(squares);
    const newSquares = squares.slice();
    newSquares[move] = "O";
    setSquares(newSquares);
    setIsXNext(true);
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

  let status = gameOver ? gameResult : "Next player: " + (isXNext ? "X" : "O");

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-200 to-purple-300 rounded-lg shadow-2xl transition-transform duration-500 ease-in-out transform hover:scale-105">
      <div className="text-2xl font-bold mb-4 text-blue-700">{status}</div>
      <div className="grid grid-cols-3 gap-2">
        {squares.map((square, i) => (
          <Square key={i} value={square} onClick={() => handleClick(i)} highlight={winningLine.includes(i)} lineDirection={lineDirection} />
        ))}
      </div>
      <button className="mt-4 px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110"
        onClick={handleRestart}>
        Restart Game
      </button>
      {gameOver && <Modal message={gameResult} onClose={handleRestart} />}
    </div>
  );
};

export default BoardBot;
