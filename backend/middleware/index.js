const rateLimit = require('express-rate-limit');
const { RateLimitRedisStore } = require('rate-limit-redis');
const { redisClient } = require('../services/redis.services');

const redisStore = new RateLimitRedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'ratelimit:',
});

const standardLimiter = rateLimit({
    store: redisStore,
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        const ip = req.ip;
        redisClient.set(`blocked:${ip}`, Date.now(), 'EX', 60 * 60);
        return res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again after 1 hour',
        });
    },
});


module.exports = {
    standardLimiter
};