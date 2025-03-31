const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { pubClient, subClient } = require('./services/redis.services');
const { standardLimiter } = require('./middleware');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
    },
    adapter: createAdapter(pubClient, subClient)
});

require('./online/online')(io);

app.use(cors());
app.use(express.json());
app.use(standardLimiter);

app.use('/', routes);

app.get('/join/:roomId', (req, res) => {
    const { roomId } = req.params;
    res.redirect(`/?room=${roomId}`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});