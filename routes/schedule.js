const express = require('express');
const router = express.Router();
const roundRobin = require('../robin'); // Import the round-robin function

router.post('/', (req, res) => {
  const { players } = req.body;
  const playerList = players.split(',').map(name => name.trim());
  const schedule = roundRobin(playerList.length, playerList);
  res.json(schedule);
});

module.exports = router;

