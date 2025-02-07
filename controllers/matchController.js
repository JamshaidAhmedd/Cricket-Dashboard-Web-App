// controllers/matchController.js
const axios = require('../utils/axiosInstance');
const logger = require('../utils/logger');
const Match = require('../models/match');
const Series = require('../models/series');
const Team = require('../models/team');
const CRICKET_API_KEY = process.env.CRICKET_API_KEY;

// Fetch all matches from the API
async function fetchAllMatches() {
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
      const matchData = response.data.data || [];
      allMatches = allMatches.concat(matchData);
      totalRows = response.data.info.totalRows;
      logger.info(`Fetched ${matchData.length} matches. Total fetched: ${allMatches.length}/${totalRows}`);
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

// Fetch and store match data
exports.fetchAndStoreMatches = async () => {
  try {
    const allMatches = await fetchAllMatches();
    logger.info(`Fetched ${allMatches.length} matches from API.`);

    for (const mData of allMatches) {
      const seriesId = mData.series_id || null;
      let foundSeries = null;
      if (seriesId) {
        foundSeries = await Series.findOne({ seriesId });
      }

      const [teamAName, teamBName] = mData.teams || [];
      let teamA = null;
      let teamB = null;

      if (teamAName) {
        teamA = await Team.findOne({ name: teamAName });
        if (!teamA) {
          teamA = new Team({
            teamId: `auto-${teamAName.replace(/\s+/g, '-').toLowerCase()}`,
            name: teamAName,
          });
          await teamA.save();
          logger.info(`Auto-created Team "${teamAName}".`);
        }
      }

      if (teamBName) {
        teamB = await Team.findOne({ name: teamBName });
        if (!teamB) {
          teamB = new Team({
            teamId: `auto-${teamBName.replace(/\s+/g, '-').toLowerCase()}`,
            name: teamBName,
          });
          await teamB.save();
          logger.info(`Auto-created Team "${teamBName}".`);
        }
      }

      let scoreA = 'N/A';
      let scoreB = 'N/A';
      if (Array.isArray(mData.score)) {
        if (mData.score[0]) scoreA = `${mData.score[0].r}/${mData.score[0].w}`;
        if (mData.score[1]) scoreB = `${mData.score[1].r}/${mData.score[1].w}`;
      }

      const matchDate = mData.dateTimeGMT ? new Date(mData.dateTimeGMT) : null;

      const existingMatch = await Match.findOne({ matchId: mData.id });
      if (!existingMatch) {
        const newMatch = new Match({
          matchId: mData.id,
          name: mData.name || '',
          matchType: mData.matchType || '',
          status: mData.status || '',
          venue: mData.venue || '',
          date: matchDate,
          dateTimeGMT: matchDate,
          teamA: teamA ? teamA._id : null,
          teamB: teamB ? teamB._id : null,
          scoreA,
          scoreB,
          series: foundSeries ? foundSeries._id : null,
          fantasyEnabled: mData.fantasyEnabled || false,
          bbbEnabled: mData.bbbEnabled || false,
          hasSquad: mData.hasSquad || false,
          matchStarted: mData.matchStarted || false,
          matchEnded: mData.matchEnded || false,
        });
        try {
          await newMatch.save();
          logger.info(`Match "${mData.name}" saved successfully.`);
        } catch (err) {
          logger.error(`Error saving match "${mData.name}": ${err.message}`);
        }
      } else {
        logger.info(`Match "${mData.name}" already exists. Skipping.`);
      }
    }
    logger.info('Matches fetched and stored successfully.');
  } catch (err) {
    logger.error(`Error in fetchAndStoreMatches: ${err.message}`);
  }
};
