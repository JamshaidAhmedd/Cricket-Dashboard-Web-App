// seeder.js
require('dotenv').config();
const mongoose = require('mongoose');
const Series = require('./models/series');
const Team = require('./models/team');
const Player = require('./models/player');
const Match = require('./models/match');

const seriesController = require('./controllers/seriesController');
const teamController = require('./controllers/teamController');
const playerController = require('./controllers/playerController');
const matchController = require('./controllers/matchController');

const logger = require('./utils/logger');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  logger.info('MongoDB Connected for Seeding');

  // Clear old data
  await Series.deleteMany({});
  logger.info('Cleared Series collection.');
  await Team.deleteMany({});
  logger.info('Cleared Teams collection.');
  await Player.deleteMany({});
  logger.info('Cleared Players collection.');
  await Match.deleteMany({});
  logger.info('Cleared Matches collection.');

  // Fetch from API + store
  await seriesController.fetchAndStoreSeries();
  await teamController.fetchAndStoreTeams();
  await playerController.fetchAndStorePlayers();
  await matchController.fetchAndStoreMatches();

  mongoose.connection.close();
  logger.info('Seeding Completed and MongoDB Connection Closed');
})
.catch(err => {
  logger.error('MongoDB Connection Error:', err);
});
