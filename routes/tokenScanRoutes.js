const express = require('express');
const router = express.Router();
const { checkHoneypot } = require('../services/honeypotService');

router.get('/:address', async (req, res) => {
  const { address } = req.params;
  const result = await checkHoneypot(address);
  res.json(result);
});

module.exports = router;
