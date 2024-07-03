import React, { useState, useEffect } from "react";
import Square from "../Components/Square";
import Modal from "../Components/Modal";

const Board_bot = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");

  useEffect(() => {
    if (!isXNext) {
      setTimeout(fetchBotMove, 1000)
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

  const handleRestart = () =>{
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine([]);
    setGameOver(false);
    setGameResult("");
  }

  const fetchBotMove = async () => {
    const response = await fetch("http://localhost:8080/move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ squares }),
    });
    const data = await response.json();
    const newSquares = squares.slice();
    newSquares[data.move] = "O";
    setSquares(newSquares);
    setIsXNext(true);
  };

  const checkGameOver = (winner, squares)=>{
    if(winner){
      setGameResult(`Winner: ${winner.player}`);
      setWinningLine(winner.line);
      setGameOver(true);
    }else if (!squares.includes(null)){
      setGameResult("It's a Draw!");
      setGameOver(true);
    }
  }

  useEffect(()=>{
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
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-4">{status}</div>
      <div className="grid grid-cols-3 gap-1">
        {squares.map((square, i) => (
          <Square key={i} value={square} onClick={() => handleClick(i)} highlight={winningLine.includes(i)} />
        ))}
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300" onClick={handleRestart}>
        Restart Game
      </button>
      {gameOver && <Modal message={gameResult} onClose={handleRestart}/>}
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
      return {player: squares[a], line: [a, b, c]};
    }
  }
  return null;
};

export default Board_bot;
