const Redis = require('ioredis');

// Configuration for Redis connections
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_HOST && process.env.REDIS_HOST.includes('upstash.io') ? {
        rejectUnauthorized: false
    } : undefined,
};


const redisClient = new Redis(redisConfig);

const pubClient = redisClient;
const subClient = pubClient.duplicate();

// Setup event handlers
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('ready', () => console.log('Redis Client Connected Successfully'));
pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
pubClient.on('ready', () => console.log('Redis Pub Client Connected Successfully'));
subClient.on('error', (err) => console.error('Redis Sub Error:', err));
subClient.on('ready', () => console.log('Redis Sub Client Connected Successfully'));

module.exports = {
    redisClient,  
    pubClient,    
    subClient     
};