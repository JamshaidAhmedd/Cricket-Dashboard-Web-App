// routes/teams.js
const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const teamController = require('../controllers/teamController');
const logger = require('../utils/logger');

// Teams List Page
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({})
      .sort({ name: 1 })
      .exec();
    res.render('teams', { teams });
  } catch (error) {
    logger.error(`Error in GET /teams: ${error.message}`);
    res.status(500).send('Server Error in /teams');
  }
});

// Team Detail Page
router.get('/:id', teamController.getTeamById);

module.exports = router;
