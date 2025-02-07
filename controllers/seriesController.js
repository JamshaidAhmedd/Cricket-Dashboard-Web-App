// controllers/seriesController.js
const axios = require('../utils/axiosInstance');
const moment = require('moment');
const logger = require('../utils/logger');
const Series = require('../models/series');

const CRICKET_API_KEY = process.env.CRICKET_API_KEY;

// Helper function to parse dates
function parseDate(dateStr) {
  if (!dateStr) return null;
  const formats = [
    'MMM DD YYYY',
    'MMM DD, YYYY',
    'MMM DD',
    'YYYY-MM-DD',
    'YYYY-MM',
    'YYYY',
  ];

  for (let f of formats) {
    let parsed;
    if (f === 'MMM DD') {
      // If only month + day, append current year
      parsed = moment(`${dateStr} ${moment().year()}`, 'MMM DD YYYY', true);
    } else {
      parsed = moment(dateStr, f, true);
    }
    if (parsed.isValid()) {
      return parsed.toDate();
    }
  }
  logger.warn(`Unable to parse date string: "${dateStr}"`);
  return null;
}

// Fetch all series from the API
async function fetchAllSeries() {
  let offset = 0;
  let allSeries = [];
  let totalRows = Infinity;

  while (offset < totalRows) {
    try {
      const response = await axios.get('/series', {
        params: { apikey: CRICKET_API_KEY, offset },
      });
      if (response.data.status !== 'success') {
        logger.error(
          `Failed to fetch series at offset ${offset}: ${response.data.reason || 'Unknown reason'}`
        );
        break;
      }
      const seriesList = response.data.data || [];
      allSeries = allSeries.concat(seriesList);
      totalRows = response.data.info.totalRows;
      logger.info(`Fetched ${seriesList.length} series. Total fetched: ${allSeries.length}/${totalRows}`);
      offset += 25;
      await new Promise(r => setTimeout(r, 1000)); // Delay to respect API rate limits
    } catch (error) {
      logger.error(`Error fetching series at offset ${offset}: ${error.message}`);
      break;
    }
  }
  return allSeries;
}

// Fetch and store series data
exports.fetchAndStoreSeries = async () => {
  try {
    const allSeries = await fetchAllSeries();
    logger.info(`Fetched ${allSeries.length} series from API.`);

    for (const sData of allSeries) {
      // Check if series already exists
      const existing = await Series.findOne({ seriesId: sData.id });
      if (!existing) {
        const startDate = parseDate(sData.startDate);
        const endDate = parseDate(sData.endDate);

        const newSeries = new Series({
          seriesId: sData.id,
          name: sData.name || '(No Name)',
          startDate,
          endDate,
          odi: sData.odi || 0,
          t20: sData.t20 || 0,
          test: sData.test || 0,
          squads: sData.squads || 0,
          matches: sData.matches || 0,
        });

        try {
          await newSeries.save();
          logger.info(`Series "${sData.name}" saved successfully.`);
        } catch (err) {
          logger.error(`Error saving series "${sData.name}": ${err.message}`);
        }
      } else {
        logger.info(`Series "${sData.name}" already exists. Skipping.`);
      }
    }
    logger.info('Series fetched and stored successfully.');
  } catch (err) {
    logger.error(`Error in fetchAndStoreSeries: ${err.message}`);
  }
};
