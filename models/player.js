// models/player.js
const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  playerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  age: { type: Number, default: null },
  role: { type: String, default: '' },
  battingStyle: { type: String, default: '' },
  bowlingStyle: { type: String, default: '' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
  stats: { type: Object, default: {} },
  image: { type: String, default: '/images/default-player.png' }, // Optional: Add player images
});

module.exports = mongoose.model('Player', PlayerSchema);
