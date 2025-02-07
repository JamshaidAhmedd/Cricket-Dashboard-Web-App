// routes/index.js
const express = require('express');
const router = express.Router();
const Match = require('../models/match');
const Series = require('../models/series');

// HOME PAGE: Show recent series & recent matches
router.get('/', async (req, res) => {
  try {
    // Last 5 series by startDate
    const recentSeries = await Series.find({})
      .sort({ startDate: -1 })
      .limit(5)
      .exec();

    // Last 5 matches by date
    const recentMatches = await Match.find({})
      .sort({ date: -1 })
      .limit(5)
      .populate('teamA teamB')
      .exec();

    res.render('index', { recentSeries, recentMatches });
  } catch (err) {
    logger.error(`Error in GET /: ${err.message}`);
    // Fallback if something fails
    res.render('index', { recentSeries: [], recentMatches: [] });
  }
});

// SCOREBOARD PAGE: Show live or recently started matches
router.get('/scoreboard', async (req, res) => {
  try {
    // Fetch matches that have started but not ended
    const scoreboardMatches = await Match.find({
      matchStarted: true,
      matchEnded: false,
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('teamA teamB')
      .exec();

    res.render('scoreboard', { scoreboardMatches });
  } catch (err) {
    logger.error(`Error in GET /scoreboard: ${err.message}`);
    res.render('scoreboard', { scoreboardMatches: [] });
  }
});

module.exports = router;
