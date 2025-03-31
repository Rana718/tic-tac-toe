const { randomUUID } = require('crypto');
const { redisClient } = require('../services/redis.services.js');

module.exports = (io) => {

    const REDIS_PREFIX = {
        ROOM: 'room:',
        WAITING: 'waiting',
        RESTART: 'restart:',
        TIMER: 'timer:'
    };


    const generateRoomId = () => {
        return randomUUID().substring(0, 8);
    };

    const createRoom = async (player1Id, player2Id = null) => {
        const roomId = generateRoomId();
        const room = {
            id: roomId,
            players: { [player1Id]: 'X' },
            messages: [],
            created: Date.now()
        };
        if (player2Id) {
            room.players[player2Id] = 'O';
        }
        await redisClient.set(`${REDIS_PREFIX.ROOM}${roomId}`, JSON.stringify(room));
        await redisClient.set(`${REDIS_PREFIX.RESTART}${roomId}`, JSON.stringify({ X: false, O: false }));
        return room;
    };

    const getRoom = async (roomId) => {
        const roomData = await redisClient.get(`${REDIS_PREFIX.ROOM}${roomId}`);
        return roomData ? JSON.parse(roomData) : null;
    };

    const joinRoom = async (roomId, playerId) => {
        const room = await getRoom(roomId);
        if (!room) return null;
        if (!room.players[playerId] && Object.keys(room.players).length < 2) {
            room.players[playerId] = 'O';
            await redisClient.set(`${REDIS_PREFIX.ROOM}${roomId}`, JSON.stringify(room));
        }
        return room;
    };

    const addMessage = async (roomId, message) => {
        const room = await getRoom(roomId);
        if (!room) return false;
        room.messages.push(message);
        await redisClient.set(`${REDIS_PREFIX.ROOM}${roomId}`, JSON.stringify(room));
        return true;
    };

    const clearRoomTimer = async (roomId) => {
        const timerKey = `${REDIS_PREFIX.TIMER}${roomId}`;
        const timerId = await redisClient.get(timerKey);
        if (timerId) {
            clearTimeout(parseInt(timerId));
            await redisClient.del(timerKey);
        }
    };

    io.on("connection", async (socket) => {
        console.log("A user connected:", socket.id);
        let currentRoomId = null;
        const roomToJoin = socket.handshake.query.room;

        if (roomToJoin) {
            const room = await joinRoom(roomToJoin, socket.id);
            if (room && Object.keys(room.players).length === 2) {
                currentRoomId = room.id;
                socket.join(currentRoomId);
                io.to(currentRoomId).emit("startGame", {
                    roomID: currentRoomId,
                    players: room.players,
                    joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                });
                io.to(currentRoomId).emit("resetBoard");
                io.to(socket.id).emit("loadMessages", room.messages);
            } else if (room) {
                currentRoomId = room.id;
                socket.join(currentRoomId);
                socket.emit("waitingForOpponent", {
                    roomID: currentRoomId,
                    joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                });
            } else {
                socket.emit("roomNotFound");
            }
        } else {
            const waitingPlayerId = await redisClient.get(REDIS_PREFIX.WAITING);
            if (waitingPlayerId) {
                const waitingHasPlayed = await redisClient.sismember("played", waitingPlayerId);
                if (waitingHasPlayed) {
                    await redisClient.del(REDIS_PREFIX.WAITING);
                    await redisClient.set(REDIS_PREFIX.WAITING, socket.id);
                    const room = await createRoom(socket.id);
                    currentRoomId = room.id;
                    socket.join(currentRoomId);
                    socket.emit("waitingForOpponent", {
                        roomID: currentRoomId,
                        joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                    });
                } else {
                    const room = await createRoom(waitingPlayerId, socket.id);
                    currentRoomId = room.id;
                    socket.join(currentRoomId);
                    io.sockets.sockets.get(waitingPlayerId)?.join(currentRoomId);
                    io.to(currentRoomId).emit("startGame", {
                        roomID: currentRoomId,
                        players: room.players,
                        joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                    });
                    io.to(currentRoomId).emit("resetBoard");
                    await redisClient.del(REDIS_PREFIX.WAITING);
                    await redisClient.sadd("played", waitingPlayerId, socket.id);
                }
            } else {
                await redisClient.set(REDIS_PREFIX.WAITING, socket.id);
                const room = await createRoom(socket.id);
                currentRoomId = room.id;
                socket.join(currentRoomId);
                socket.emit("waitingForOpponent", {
                    roomID: currentRoomId,
                    joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                });
            }
        }

        socket.on("move", async (data) => {
            const { roomID, index, player } = data;
            socket.to(roomID).emit("update", { index, player });
        });

        socket.on("restart", async (data) => {
            const { roomID, player } = data;
            const restartKey = `${REDIS_PREFIX.RESTART}${roomID}`;
            let restartRequests = JSON.parse(await redisClient.get(restartKey) || '{"X":false,"O":false}');
            restartRequests[player] = true;
            await redisClient.set(restartKey, JSON.stringify(restartRequests));
            if (restartRequests.X && restartRequests.O) {
                await clearRoomTimer(roomID);
                io.to(roomID).emit("resetBoard");
                await redisClient.set(restartKey, JSON.stringify({ X: false, O: false }));
            } else {
                io.to(roomID).emit("startTimer");
                const timerId = setTimeout(async () => {
                    restartRequests = JSON.parse(await redisClient.get(restartKey) || '{"X":false,"O":false}');
                    if (!restartRequests.X || !restartRequests.O) {
                        io.to(roomID).emit("gameOver", { message: "Sorry, I can't play more this time." });
                        io.to(roomID).emit("showFindNewPlayerButton");
                    }
                }, 20000);
                await redisClient.set(`${REDIS_PREFIX.TIMER}${roomID}`, timerId.toString());
            }
        });

        socket.on("sendMessage", async (data) => {
            const { roomID, message, player } = data;
            const messageObj = {
                text: message,
                player,
                timestamp: Date.now()
            };
            const success = await addMessage(roomID, messageObj);
            if (success) {
                io.to(roomID).emit("newMessage", messageObj);
            }
        });

        socket.on("findNewPlayer", async () => {
            if (currentRoomId) {
                socket.leave(currentRoomId);
            }
            const waitingPlayerId = await redisClient.get(REDIS_PREFIX.WAITING);
            if (waitingPlayerId) {
                const room = await createRoom(waitingPlayerId, socket.id);
                currentRoomId = room.id;
                socket.join(currentRoomId);
                io.sockets.sockets.get(waitingPlayerId)?.join(currentRoomId);
                io.to(currentRoomId).emit("startGame", {
                    roomID: currentRoomId,
                    players: room.players,
                    joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                });
                io.to(currentRoomId).emit("resetBoard");
                await redisClient.del(REDIS_PREFIX.WAITING);
                await redisClient.sadd("played", waitingPlayerId, socket.id);
            } else {
                await redisClient.set(REDIS_PREFIX.WAITING, socket.id);
                const room = await createRoom(socket.id);
                currentRoomId = room.id;
                socket.join(currentRoomId);
                socket.emit("waitingForOpponent", {
                    roomID: currentRoomId,
                    joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?room=${currentRoomId}`
                });
            }
        });

        socket.on("disconnect", async () => {
            console.log("User disconnected:", socket.id);
            const waitingPlayerId = await redisClient.get(REDIS_PREFIX.WAITING);
            if (waitingPlayerId === socket.id) {
                await redisClient.del(REDIS_PREFIX.WAITING);
            }
            if (currentRoomId) {
                const room = await getRoom(currentRoomId);
                if (room) {
                    io.to(currentRoomId).emit("userDisconnected");
                    await clearRoomTimer(currentRoomId);
                    await redisClient.del(`${REDIS_PREFIX.ROOM}${currentRoomId}`);
                    await redisClient.del(`${REDIS_PREFIX.RESTART}${currentRoomId}`);
                }
            }
        });

        socket.on("gameOver", async ({ roomID, winner }) => {
            const room = await getRoom(roomID);
            if (!room) {
                console.error(`Room ${roomID} not found`);
                return;
            }
            const players = room.players;
            const winnerSocketId = Object.keys(players).find(id => players[id] === winner);
            const loserSocketId = Object.keys(players).find(id => players[id] !== winner);
            io.to(winnerSocketId).emit("gameOver", { message: "🎉 Congratulations! You've emerged victorious! 🏆" });
            io.to(loserSocketId).emit("gameOver", { message: "😔 Tough luck this time. Better luck next game!" });
        });
    });
};
