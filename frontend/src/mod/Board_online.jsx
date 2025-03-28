"use client"

import { useState, useEffect, useRef } from "react"
import Square from "../Components/Square"
import Modal from "../Components/Modal"
import io from "socket.io-client"
import { calculateWinner, getLineDirection } from "../utils/gameUtils"
import { Clock, ArrowRight, AlertCircle, MessageCircle, X } from "lucide-react"

const Board_online = () => {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winningLine, setWinningLine] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState("")
  const [roomID, setRoomID] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStartMessage, setShowStartMessage] = useState(false)
  const [players, setPlayers] = useState({})
  const [playerSymbol, setPlayerSymbol] = useState("")
  const [lineDirection, setLineDirection] = useState("")
  const [timer, setTimer] = useState(null)
  const [showFindNewPlayerButton, setShowFindNewPlayerButton] = useState(false)
  const [findNewPlayer, setFindNewPlayer] = useState(false)
  const [joinUrl, setJoinUrl] = useState("")
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [waitingRoom, setWaitingRoom] = useState(false)
  const [playerConnected, setPlayerConnected] = useState(false)
  const [unseenMessages, setUnseenMessages] = useState(0)

  const socket = useRef(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const boardRef = useRef(null)
  const chatOpenRef = useRef(showChat)

  useEffect(() => {
    chatOpenRef.current = showChat
  }, [showChat])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomFromUrl = urlParams.get("room")
    const socketOptions = roomFromUrl ? { query: { room: roomFromUrl } } : {}
    socket.current = io("http://localhost:3000", socketOptions)

    socket.current.on("connect", () => {
      console.log("Socket.IO Client Connected")
      setPlayerConnected(true)
    })

    socket.current.on("disconnect", () => {
      setPlayerConnected(false)
    })

    socket.current.on("startGame", ({ roomID, players, joinUrl }) => {
      setRoomID(roomID)
      setPlayers(players)
      setPlayerSymbol(players[socket.current.id])
      setLoading(false)
      setWaitingRoom(false)
      setFindNewPlayer(false)
      setShowStartMessage(true)
      setGameOver(false)
      setJoinUrl(joinUrl)
      setMessages([])
      setUnseenMessages(0)
      setTimeout(() => {
        setShowStartMessage(false)
      }, 2000)
    })

    socket.current.on("waitingForOpponent", ({ roomID, joinUrl }) => {
      setRoomID(roomID)
      setLoading(false)
      setWaitingRoom(true)
      setJoinUrl(joinUrl)
    })

    socket.current.on("roomNotFound", () => {
      setLoading(false)
      setGameOver(true)
      setGameResult("Room not found. Please try a different room or start a new game.")
      setShowFindNewPlayerButton(true)
      setFindNewPlayer(true)
      setMessages([])
    })

    socket.current.on("update", ({ index, player }) => {
      setSquares((prevSquares) => {
        const newSquares = prevSquares.slice()
        newSquares[index] = player
        return newSquares
      })
      setIsXNext((prevIsXNext) => !prevIsXNext)
    })

    socket.current.on("startTimer", () => {
      setTimer(20)
    })

    socket.current.on("userDisconnected", () => {
      setGameResult("Your opponent has left the match.")
      setGameOver(true)
      setShowFindNewPlayerButton(true)
      setFindNewPlayer(true)
      setMessages([])
    })

    socket.current.on("gameOver", ({ message }) => {
      setGameResult(message)
      setGameOver(true)
    })

    socket.current.on("showFindNewPlayerButton", () => {
      setShowFindNewPlayerButton(true)
      setFindNewPlayer(true)
    })

    socket.current.on("loadMessages", (chatMessages) => {
      setMessages(chatMessages)
    })

    socket.current.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message])
      if (!chatOpenRef.current) {
        setUnseenMessages((prev) => prev + 1)
      }
    })

    return () => {
      socket.current.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showChat &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target) &&
        !event.target.closest(".chat-toggle-btn")
      ) {
        setShowChat(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showChat])

  useEffect(() => {
    const positionChatButton = () => {
      const chatButton = document.querySelector(".chat-toggle-btn")
      if (chatButton && boardRef.current) {
        if (window.innerWidth <= 768) {
          chatButton.style.bottom = "20px"
          chatButton.style.right = "20px"
        } else {
          chatButton.style.right = "20px"
          chatButton.style.bottom = "20px"
        }
      }
    }
    positionChatButton()
    window.addEventListener("resize", positionChatButton)
    return () => window.removeEventListener("resize", positionChatButton)
  }, [loading, waitingRoom, showStartMessage])

  useEffect(() => {
    if (timer === 0) {
      setTimer(null)
    } else if (timer > 0) {
      const timerId = setTimeout(() => {
        setTimer(timer - 1)
      }, 1000)
      return () => clearTimeout(timerId)
    }
  }, [timer])

  useEffect(() => {
    const winner = calculateWinner(squares)
    checkGameOver(winner, squares)
  }, [squares])

  const handleClick = (i) => {
    if (calculateWinner(squares) || squares[i] || gameOver) return

    const player = players[socket.current.id]
    if (player !== (isXNext ? "X" : "O")) return

    const newSquares = squares.slice()
    newSquares[i] = player
    setSquares(newSquares)

    socket.current.emit("move", {
      roomID,
      index: i,
      player: player,
    })

    setIsXNext(!isXNext)
  }

  const handleFindNewPlayer = () => {
    socket.current.emit("findNewPlayer")
    setLoading(true)
    setShowFindNewPlayerButton(false)
    setFindNewPlayer(true)
    setWaitingRoom(false)
    setMessages([])
    setShowChat(false)
    setUnseenMessages(0)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      socket.current.emit("sendMessage", {
        roomID,
        message: newMessage,
        player: playerSymbol,
      })
      setNewMessage("")
    }
  }

  const toggleChat = (e) => {
    e.preventDefault()
    if (!showChat) {
      setUnseenMessages(0)
    }
    setShowChat((prev) => !prev)
  }

  const checkGameOver = (winner, squares) => {
    if (winner) {
      socket.current.emit("gameOver", { roomID, winner: winner.player })
      setWinningLine(winner.line)
      setGameOver(true)
      setLineDirection(getLineDirection(winner.line))
    } else if (!squares.includes(null)) {
      setGameResult("It's a Draw!")
      setGameOver(true)
    }
  }

  const renderStatus = () => {
    if (gameOver) {
      return (
        <div className="flex items-center justify-center gap-2 text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          <AlertCircle className="text-purple-400" size={24} />
          <span>Match Finished</span>
        </div>
      )
    } else if (playerSymbol === (isXNext ? "X" : "O")) {
      return (
        <div className="flex items-center justify-center gap-2 text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
          <ArrowRight className="text-cyan-400 animate-pulse" size={24} />
          <span>Your Turn</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-center gap-2 text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-slate-400">
          <Clock className="text-slate-400" size={24} />
          <span>Waiting for Opponent</span>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-sm mx-5">
      <div
        ref={boardRef}
        className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-800 to-slate-900 rounded-xl shadow-2xl transition-all duration-300 ease-in-out border border-purple-500/20 relative w-full"
      >
        {!playerConnected ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Connecting to server...
            </div>
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 animate-pulse">
              Finding Your Opponent
            </div>
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : waitingRoom ? (
          <div className="flex flex-col items-center p-4">
            <div className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Waiting for opponent to join...
            </div>
            <div className="mb-4 text-white text-center">
              Share this link with your friend to play together:
            </div>
            <div className="flex items-center mb-6 w-full max-w-xs">
              <input
                type="text"
                value={joinUrl}
                readOnly
                className="bg-gray-700 text-white px-3 py-2 rounded-l-md w-full text-sm focus:outline-none overflow-hidden text-ellipsis"
              />
              <button
                onClick={() => navigator.clipboard.writeText(joinUrl)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-r-md whitespace-nowrap transition-colors duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        ) : showStartMessage ? (
          <div className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 py-8 animate-fadeIn">
            Game Starting... You are: {playerSymbol}
          </div>
        ) : (
          <>
            {renderStatus()}
            <div className="grid grid-cols-3 gap-3 transition-opacity duration-300">
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
            {gameOver && (
              <Modal
                message={gameResult}
                onClose={handleFindNewPlayer}
                button_message={"Play Again"}
                timer={timer}
              />
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={toggleChat}
        className="chat-toggle-btn fixed z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg flex items-center justify-center transition-all duration-200"
        style={{
          bottom: "20px",
          right: "20px",
        }}
      >
        {showChat ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            {unseenMessages > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full transition-all duration-200">
                {unseenMessages}
              </span>
            )}
          </div>
        )}
      </button>

      {showChat && (
        <div
          ref={chatContainerRef}
          className="fixed z-30 bg-gray-800 rounded-md shadow-lg flex flex-col border border-cyan-800 transition-all duration-300 ease-in-out animate-slideUp"
          style={{
            bottom: "80px",
            right: "20px",
            width: "min(85vw, 320px)",
            height: "min(60vh, 400px)",
          }}
        >
          <div className="p-2 bg-gray-700 text-white text-center rounded-t-md">
            Game Chat
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center italic text-sm">No messages yet</div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md max-w-[85%] ${msg.player === playerSymbol ? "bg-blue-700 ml-auto" : "bg-gray-700"
                    } text-white text-sm break-words animate-fadeIn`}
                >
                  <div className="text-xs text-gray-300">{msg.player}</div>
                  {msg.text}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-700 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white px-2 py-1 rounded-l-md focus:outline-none text-sm"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-r-md text-sm transition-colors duration-200">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Board_online
