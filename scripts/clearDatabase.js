// scripts/clearDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const Series = require('../models/series');
const Team = require('../models/team');
const Player = require('../models/player');
const Match = require('../models/match');

const logger = require('../utils/logger');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  logger.info('MongoDB Connected for DB Clearing');

  await Series.deleteMany({});
  logger.info('Cleared Series collection.');
  await Team.deleteMany({});
  logger.info('Cleared Teams collection.');
  await Player.deleteMany({});
  logger.info('Cleared Players collection.');
  await Match.deleteMany({});
  logger.info('Cleared Matches collection.');

  mongoose.connection.close();
  logger.info('Database Cleared and Connection Closed');
})
.catch(err => {
  logger.error('Error clearing DB:', err);
});
