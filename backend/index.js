const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});


require('./online/online')(io);

app.use(cors());
app.use(express.json());
app.use('/', routes);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
