// routes/players.js
const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const playerController = require('../controllers/playerController');
const logger = require('../utils/logger');

// Players List Page with Pagination
router.get('/', async (req, res) => {
  const perPage = 25;
  const page = parseInt(req.query.page) || 1;

  try {
    const players = await Player.find({})
      .populate('team')
      .sort({ name: 1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec();

    const count = await Player.countDocuments();

    res.render('players', {
      players,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    logger.error(`Error in GET /players: ${error.message}`);
    res.status(500).send('Server Error in /players');
  }
});

// Player Detail Page
router.get('/:id', playerController.getPlayerById);

module.exports = router;
