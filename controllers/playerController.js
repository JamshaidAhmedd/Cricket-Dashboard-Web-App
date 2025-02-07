// controllers/playerController.js
const axios = require('../utils/axiosInstance');
const logger = require('../utils/logger');
const Player = require('../models/player');
const Team = require('../models/team');
const CRICKET_API_KEY = process.env.CRICKET_API_KEY;

// Fetch all players from the API
async function fetchAllPlayers() {
  let offset = 0;
  let allPlayers = [];
  let totalRows = Infinity;

  while (offset < totalRows) {
    try {
      const response = await axios.get('/players', {
        params: { apikey: CRICKET_API_KEY, offset },
      });
      if (response.data.status !== 'success') {
        logger.error(
          `Failed to fetch players at offset ${offset}: ${response.data.reason || 'Unknown reason'}`
        );
        break;
      }
      const playersList = response.data.data || [];
      allPlayers = allPlayers.concat(playersList);
      totalRows = response.data.info.totalRows;
      logger.info(`Fetched ${playersList.length} players. Total fetched: ${allPlayers.length}/${totalRows}`);
      offset += 25;
      await new Promise(r => setTimeout(r, 1000)); // Delay to respect API rate limits
    } catch (error) {
      logger.error(`Error fetching players at offset ${offset}: ${error.message}`);
      break;
    }
    // Stop after fetching 300 players to limit processing
    if (allPlayers.length >= 300) break;
  }
  return allPlayers;
}

// Fetch and store player data
exports.fetchAndStorePlayers = async () => {
  try {
    const allPlayers = await fetchAllPlayers();
    logger.info(`Fetched ${allPlayers.length} players from API.`);

    for (const pData of allPlayers) {
      let existing = await Player.findOne({ playerId: pData.id });
      if (!existing) {
        const newPlayer = new Player({
          playerId: pData.id,
          name: pData.name || '', // Fallback to empty string if name is missing
          age: pData.age || null,
          role: pData.role || '',
          battingStyle: pData.batting_style || '',
          bowlingStyle: pData.bowling_style || '',
          team: null, // Optionally associate with a team
          stats: {},
        });
        try {
          await newPlayer.save();
          logger.info(`Player "${pData.name}" saved successfully.`);
        } catch (err) {
          logger.error(`Error saving player "${pData.name}": ${err.message}`);
        }
      } else {
        logger.info(`Player "${pData.name}" already exists. Skipping.`);
      }
    }
    logger.info('Players fetched and stored successfully.');
  } catch (err) {
    logger.error(`Error in fetchAndStorePlayers: ${err.message}`);
  }
};

// Get player details by ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('team').exec();
    if (!player) {
      return res.status(404).render('404', { message: 'Player not found' });
    }
    res.render('playerDetail', { player });
  } catch (error) {
    logger.error(`Error fetching player with ID ${req.params.id}: ${error.message}`);
    res.status(500).send('Server Error');
  }
};
