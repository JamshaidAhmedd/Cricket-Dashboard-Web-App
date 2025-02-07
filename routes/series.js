// routes/series.js
const express = require('express');
const router = express.Router();
const Series = require('../models/series');
const logger = require('../utils/logger');

// Series List Page
router.get('/', async (req, res) => {
  try {
    const seriesList = await Series.find({})
      .sort({ startDate: -1 })
      .exec();
    res.render('series', { series: seriesList });
  } catch (err) {
    logger.error(`Error in GET /series: ${err.message}`);
    res.status(500).send('Server Error in /series');
  }
});

// (Optional) Individual Series Detail Page
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id).exec();
    if (!series) {
      return res.status(404).render('404', { message: 'Series not found' });
    }
    res.render('seriesDetail', { series });
  } catch (error) {
    logger.error(`Error in GET /series/${req.params.id}: ${error.message}`);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
