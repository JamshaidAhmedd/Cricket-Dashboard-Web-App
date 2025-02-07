// models/match.js
const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
  matchType: { type: String, default: '' },
  status: { type: String, default: '' },
  venue: { type: String, default: '' },
  date: { type: Date, default: null },
  dateTimeGMT: { type: Date, default: null },
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
  scoreA: { type: String, default: 'N/A' },
  scoreB: { type: String, default: 'N/A' },
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series', required: false },
  fantasyEnabled: { type: Boolean, default: false },
  bbbEnabled: { type: Boolean, default: false },
  hasSquad: { type: Boolean, default: false },
  matchStarted: { type: Boolean, default: false },
  matchEnded: { type: Boolean, default: false },
});

module.exports = mongoose.model('Match', MatchSchema);
