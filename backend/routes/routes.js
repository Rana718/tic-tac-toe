const express = require('express');
const onlineRouter = require('../online/online');

const router = express.Router();

router.use('/online', onlineRouter);


router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});


router.get('/rooms/:roomId/exists', async (req, res) => {
  const { roomId } = req.params;
  res.json({ exists: true, roomId });
});

module.exports = router;
