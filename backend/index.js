const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const http = require('http');
const { Server } = require('socket.io');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');

const app = express();
const server = http.createServer(app);

const pubClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});
const subClient = pubClient.duplicate();

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

app.use('/', routes);


app.get('/join/:roomId', (req, res) => {
    const { roomId } = req.params;
    res.redirect(`/?room=${roomId}`);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
subClient.on('error', (err) => console.error('Redis Sub Error:', err));
