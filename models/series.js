// models/series.js
const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
  seriesId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  odi: { type: Number, default: 0 },
  t20: { type: Number, default: 0 },
  test: { type: Number, default: 0 },
  squads: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
});

module.exports = mongoose.model('Series', SeriesSchema);
