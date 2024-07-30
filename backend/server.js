const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors())
let waitingPlayer = null;
const restartRequests = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    if (waitingPlayer) {
        const roomID = `${waitingPlayer.id}#${socket.id}`;
        const players = {
            [waitingPlayer.id]: "X",
            [socket.id]: "O",
        };
        waitingPlayer.join(roomID);
        socket.join(roomID);

        io.to(roomID).emit("startGame", { roomID, players });

        restartRequests[roomID] = { X: false, O: false };

        waitingPlayer = null;
    } else {
        waitingPlayer = socket;
    }

    socket.on("move", (data) => {
        const { roomID, index, player } = data;
        socket.to(roomID).emit("update", { index, player });
    });

    socket.on("restart", (data) => {
        const { roomID, player } = data;
        restartRequests[roomID][player] = true;

        if (restartRequests[roomID].X && restartRequests[roomID].O) {
            io.to(roomID).emit("resetBoard");
            restartRequests[roomID] = { X: false, O: false };
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

server.listen(5001, () => {
    console.log("Listening on port 5001");
});
