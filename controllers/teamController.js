// controllers/teamController.js
const axios = require('../utils/axiosInstance');
const logger = require('../utils/logger');
const Team = require('../models/team');
const Match = require('../models/match');
const CRICKET_API_KEY = process.env.CRICKET_API_KEY;

// Fetch all matches to extract unique team names
async function fetchAllMatchesForTeams() {
  let offset = 0;
  let allMatches = [];
  let totalRows = Infinity;

  while (offset < totalRows) {
    try {
      const response = await axios.get('/matches', {
        params: { apikey: CRICKET_API_KEY, offset },
      });
      if (response.data.status !== 'success') {
        logger.error(
          `Failed to fetch matches at offset ${offset}: ${response.data.reason || 'Unknown reason'}`
        );
        break;
      }
      const matchList = response.data.data || [];
      allMatches = allMatches.concat(matchList);
      totalRows = response.data.info.totalRows;
      logger.info(`Fetched ${matchList.length} matches. Total fetched: ${allMatches.length}/${totalRows}`);
      offset += 25;
      await new Promise(r => setTimeout(r, 1000)); // Delay to respect API rate limits
    } catch (error) {
      logger.error(`Error fetching matches at offset ${offset}: ${error.message}`);
      break;
    }
    // Stop after fetching 300 matches to limit processing
    if (allMatches.length >= 300) break;
  }
  return allMatches;
}

// Extract unique team names from matches
function extractUniqueTeamNames(matches) {
  const teamNames = new Set();
  matches.forEach(m => {
    if (Array.isArray(m.teams)) {
      m.teams.forEach(name => {
        if (name && name.trim()) {
          teamNames.add(name.trim());
        }
      });
    }
  });
  return teamNames;
}

// Fetch and store team data
exports.fetchAndStoreTeams = async () => {
  try {
    const matches = await fetchAllMatchesForTeams();
    const uniqueTeams = extractUniqueTeamNames(matches);

    logger.info(`Extracted ${uniqueTeams.size} unique teams from matches.`);

    for (const teamName of uniqueTeams) {
      const existing = await Team.findOne({ name: teamName });
      if (!existing) {
        const newTeam = new Team({
          teamId: `auto-${teamName.replace(/\s+/g, '-').toLowerCase()}`,
          name: teamName,
          country: 'Unknown', // You can enhance this by mapping team names to countries
          logo: '', // Optionally add team logos
        });

        try {
          await newTeam.save();
          logger.info(`Team "${teamName}" saved successfully.`);
        } catch (err) {
          logger.error(`Error saving team "${teamName}": ${err.message}`);
        }
      } else {
        logger.info(`Team "${teamName}" already exists. Skipping.`);
      }
    }
    logger.info('Teams fetched and stored successfully.');
  } catch (err) {
    logger.error(`Error in fetchAndStoreTeams: ${err.message}`);
  }
};

// Get team details by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('players').exec();
    if (!team) {
      return res.status(404).render('404', { message: 'Team not found' });
    }
    res.render('teamDetail', { team });
  } catch (error) {
    logger.error(`Error fetching team with ID ${req.params.id}: ${error.message}`);
    res.status(500).send('Server Error');
  }
};
