const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/translate
// body: { q: 'text', source: 'en', target: 'hi' }
router.post('/', async (req, res) => {
  try {
    const { q, source = 'auto', target = 'en' } = req.body;
    if (!q) return res.status(400).json({ success: false, message: 'Text (q) is required' });

    // Use LibreTranslate public instance as fallback
    const resp = await axios.post('https://libretranslate.com/translate', {
      q,
      source,
      target,
      format: 'text'
    }, {
      headers: { 'accept': 'application/json', 'content-type': 'application/json' }
    });

    return res.json({ success: true, translatedText: resp.data.translatedText });
  } catch (err) {
    console.error('Translate API error:', err.message || err);
    return res.status(500).json({ success: false, message: 'Translation failed', error: err.message });
  }
});

module.exports = router;
