// routes/search.js
const express = require('express');
const router = express.Router();
const Player = require('../models/player');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// GET Search Page
router.get('/', (req, res) => {
  res.render('search', { players: [], error: null, query: '' });
});

// POST Search Query
router.post('/player', 
  body('query').trim().notEmpty().withMessage('Player name is required.'),
  async (req, res) => {
    const errors = validationResult(req);
    const query = req.body.query.trim();

    if (!errors.isEmpty()) {
      return res.render('search', { error: errors.array()[0].msg, players: [], query });
    }

    try {
      const regex = new RegExp(query, 'i'); // Case-insensitive search
      const players = await Player.find({ name: regex })
        .populate('team')
        .exec();
      res.render('search', { players, error: null, query });
    } catch (error) {
      logger.error(`Error searching for players: ${error.message}`);
      res.render('search', { error: 'An error occurred while searching.', players: [], query });
    }
});

module.exports = router;
