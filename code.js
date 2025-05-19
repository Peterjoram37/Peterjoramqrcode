const express = require('express');
const router = express.Router();

// Hii ni route, unaweza kubadilisha kulingana na mahitaji yako
router.get('/', (req, res) => {
  res.json({ message: "Code route is working!" });
});

module.exports = router;