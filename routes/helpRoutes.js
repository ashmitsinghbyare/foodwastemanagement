const express = require('express');
const HelpCategory = require('../models/helpCategory');
const router = express.Router();

router.get('/help', async (req, res) => {
  try {
    const categories = await HelpCategory.find();
    res.render('help', { categories });
  } catch (err) {
    res.status(500).send('Error retrieving help categories');
  }
});

module.exports = router;
