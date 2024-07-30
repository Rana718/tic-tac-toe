const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

let waitingPlayer = null;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  
  if (waitingPlayer) {
    const roomID = `${waitingPlayer.id}#${socket.id}`;
    waitingPlayer.join(roomID);
    socket.join(roomID);

    io.to(roomID).emit("startGame", { roomID });

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
  }

  socket.on("move", (data) => {
    const { roomID, index, player } = data;
    socket.to(roomID).emit("update", { index, player });
  });

  socket.on("restart", (roomID) => {
    io.to(roomID).emit("resetBoard");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
  });
});

server.listen(5001, () => {
  console.log("Listening on port 8000");
});
