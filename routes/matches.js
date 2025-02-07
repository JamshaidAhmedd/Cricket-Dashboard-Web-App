// routes/matches.js
const express = require('express');
const router = express.Router();
const Match = require('../models/match');
const logger = require('../utils/logger');

// Matches List Page with Pagination
router.get('/', async (req, res) => {
  const perPage = 25;
  const page = parseInt(req.query.page) || 1;

  try {
    const matches = await Match.find({})
      .populate('teamA teamB')
      .sort({ date: -1 })
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec();

    const count = await Match.countDocuments();

    res.render('matches', {
      matches,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (error) {
    logger.error(`Error in GET /matches: ${error.message}`);
    res.status(500).send('Server Error in /matches');
  }
});

// (Optional) Individual Match Detail Page
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teamA teamB series')
      .exec();
    if (!match) {
      return res.status(404).render('404', { message: 'Match not found' });
    }
    res.render('matchDetail', { match });
  } catch (error) {
    logger.error(`Error in GET /matches/${req.params.id}: ${error.message}`);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
