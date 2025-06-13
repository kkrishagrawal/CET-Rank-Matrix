// routes/index.js
const express = require('express');
const router = express.Router();

// Import controllers
const { filterOptions } = require('../controllers/filterOptions');
const { getCETData } = require('../controllers/cetData');
const { getStatistics } = require('../controllers/statistics');

// Filter options routes
router.get('/api/filter-options', filterOptions);

// CET data routes
router.get('/api/cet-data', getCETData);

// Statistics routes
router.get('/api/statistics', getStatistics);

module.exports = router;