module.exports = (io) => {
    let waitingPlayer = null;
    const restartRequests = {};
    const rooms = {};

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

            rooms[roomID] = players;
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

        const notifyPlayers = (roomID, winnerPlayer, players) =>{
            const winnerSocketId = Object.keys(players).find(id => players[id] === winnerPlayer);
            const loserSocketId = Object.keys(players).find(id => players[id] !== winnerPlayer);
            io.to(winnerSocketId).emit("gameOver", { message: "🎉 Congratulations! You’ve emerged victorious! 🏆" });
            io.to(loserSocketId).emit("gameOver", { message: "😔 Tough luck this time. Better luck next game!" });

        }

        socket.on("gameOver", ({ roomID, winner }) => {
            const players = rooms[roomID];
            if(!players){
                console.error(`Players not found for room ${roomID}`);
                return;
            }
            
            notifyPlayers(roomID, winner, players);
        })
    });
};
