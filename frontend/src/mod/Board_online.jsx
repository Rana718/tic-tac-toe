import React, { useState, useEffect, useRef } from "react";
import Square from "../Components/Square";
import Modal from "../Components/Modal";
import io from "socket.io-client";
import { calculateWinner, getLineDirection } from "../utils/gameUtils";

const Board_online = () => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winningLine, setWinningLine] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [roomID, setRoomID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStartMessage, setShowStartMessage] = useState(false);
  const [players, setPlayers] = useState({});
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [lineDirection, setLineDirection] = useState("");
  const [timer, setTimer] = useState(null);
  const [showFindNewPlayerButton, setShowFindNewPlayerButton] = useState(false);
  const [findNewPlayer, setFindNewPlayer] = useState(false);

  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000");

    socket.current.on("connect", () => {
      console.log("Socket.IO Client Connected");
    });

    socket.current.on("startGame", ({ roomID, players }) => {
      setRoomID(roomID);
      setPlayers(players);
      setPlayerSymbol(players[socket.current.id]);
      setLoading(false);
      setFindNewPlayer(false);
      setShowStartMessage(true);
      setGameOver(false);
      setTimeout(() => {
        setShowStartMessage(false);
      }, 2000);
    });

    socket.current.on("update", ({ index, player }) => {
      setSquares((prevSquares) => {
        const newSquares = prevSquares.slice();
        newSquares[index] = player;
        return newSquares;
      });
      setIsXNext((prevIsXNext) => !prevIsXNext);
      checkGameOver(calculateWinner(squares), squares);
    });

    socket.current.on("resetBoard", () => {
      setSquares(Array(9).fill(null));
      setIsXNext(true);
      setWinningLine([]);
      setGameOver(false);
      setGameResult("");
      setShowFindNewPlayerButton(false);
      setTimer(null);  
    });

    socket.current.on("startTimer", () => {
      setTimer(20);
    });

    socket.current.on("userDisconnected", () => {
      setGameResult("Your opponent has left the match.");
      setGameOver(true);
      setShowFindNewPlayerButton(true);
      setFindNewPlayer(true);
    });

    socket.current.on("gameOver", ({ message }) => {
      setGameResult(message);
      setGameOver(true);
    });

    socket.current.on("showFindNewPlayerButton", () => {
      setShowFindNewPlayerButton(true);
      setFindNewPlayer(true);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setTimer(null);
    } else if (timer > 0) {
      const timerId = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [timer]);

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i] || gameOver) {
      return;
    }

    const player = players[socket.current.id];
    if (player !== (isXNext ? "X" : "O")) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[i] = player;
    setSquares(newSquares);

    socket.current.emit("move", {
      roomID,
      index: i,
      player: player,
    });

    setIsXNext(!isXNext);
  };

  const handleRestart = () => {
    socket.current.emit("restart", { roomID, player: playerSymbol });
    setLineDirection("");
    setFindNewPlayer(false);
  };

  const handleFindNewPlayer = () => {
    socket.current.emit("findNewPlayer");
    setLoading(true);
    setShowFindNewPlayerButton(false);
    setFindNewPlayer(true);
  };

  const checkGameOver = (winner, squares) => {
    if (winner) {
      socket.current.emit("gameOver", { roomID, winner: winner.player });
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
    status = "Match is Finish";
  } else {
    status = "Next player: " + (isXNext ? "X" : "O");
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-200 to-purple-300 rounded-lg shadow-2xl transition-transform duration-500 ease-in-out transform hover:scale-105">
      {loading ? (
        <div className="flex items-center space-x-2">
        <div className="text-2xl font-bold mb-4 text-blue-700 animate-pulse">Finding Your Opponent</div>
        <svg className="w-6 h-6 text-blue-700 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
        </svg>
      </div>
      ) : showStartMessage ? (
        <div className="text-2xl font-bold mb-4 text-blue-700">
          Game Starting... You are: {playerSymbol}
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold mb-4 text-blue-700">{status}</div>
          <div className="grid grid-cols-3 gap-1">
            {squares.map((square, i) => (
              <Square key={i} value={square} onClick={() => handleClick(i)} highlight={winningLine.includes(i)} lineDirection={lineDirection} />
            ))}
          </div>
          
          
          {gameOver && (
            <Modal
              message={gameResult}
              onClose={findNewPlayer ? handleFindNewPlayer : handleRestart}
              button_message={findNewPlayer ? "Find New Player" : "Play Again"}
              timer={timer}/>
          )}
        </>
      )}
    </div>
  );
};

export default Board_online;
