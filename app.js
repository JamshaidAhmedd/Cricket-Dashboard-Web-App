// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Route modules
const indexRoutes = require('./routes/index');
const matchesRoutes = require('./routes/matches');
const seriesRoutes = require('./routes/series');
const teamsRoutes = require('./routes/teams');
const playersRoutes = require('./routes/players');
const searchRoutes = require('./routes/search');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB Connected');
})
.catch(err => {
  logger.error('MongoDB Connection Error:', err);
});

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/', indexRoutes);
app.use('/matches', matchesRoutes);
app.use('/series', seriesRoutes);
app.use('/teams', teamsRoutes);
app.use('/players', playersRoutes);
app.use('/search', searchRoutes);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

// 500 Server Error handler
app.use((err, req, res, next) => {
  logger.error(`Server Error: ${err.message}`);
  res.status(500).render('500', { message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
