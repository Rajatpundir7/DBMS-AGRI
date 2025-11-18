const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const body = req.body || {};
    const q = body.q || body.text || '';
    const source = body.source || 'auto';
    const target = body.target || 'en';
    if (!q) return res.status(400).json({ success: false, message: 'Text (q) is required' });
    const resp = await axios.post('https://libretranslate.com/translate', { q, source, target, format: 'text' }, { headers: { 'accept': 'application/json', 'content-type': 'application/json' } });
    return res.json({ success: true, translatedText: resp.data.translatedText });
  } catch (err) {
    console.error('translate error', err.message || err);
    return res.status(500).json({ success: false, message: 'Translation failed', error: err.message });
  }
};
