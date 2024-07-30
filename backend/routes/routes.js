const express = require('express');
const onlineRouter = require('../online/online');

const router = express.Router();

router.use('/online', onlineRouter);

module.exports = router;
