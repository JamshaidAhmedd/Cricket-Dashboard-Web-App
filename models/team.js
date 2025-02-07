// models/team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  country: { type: String, default: 'Unknown' },
  logo: { type: String, default: '' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
});

module.exports = mongoose.model('Team', TeamSchema);
