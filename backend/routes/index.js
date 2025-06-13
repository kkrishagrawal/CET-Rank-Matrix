// routes/index.js
const express = require('express');
const router = express.Router();
const cors = require("cors");

require("dotenv").config();

const { createClient } = require('@supabase/supabase-js'); // <- make sure you have this
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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