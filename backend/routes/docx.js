const express = require('express');
const router = express.Router();
const path = require('path');

// Try to extract links from cloudlink.docx using mammoth if available
router.get('/images', async (req, res) => {
  try {
    const docxPath = path.join(__dirname, '..', '..', 'cloudlink.docx');
    let mammoth;
    try {
      mammoth = require('mammoth');
    } catch (e) {
      console.warn('mammoth not installed; returning empty image list');
      return res.json({ success: true, images: [] });
    }

    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value || '';

    // simple URL regex
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = text.match(urlRegex) || [];

    // Deduplicate and return
    const images = Array.from(new Set(matches));
    return res.json({ success: true, images });
  } catch (err) {
    console.error('docx extract error', err.message || err);
    return res.status(500).json({ success: false, images: [], error: err.message });
  }
});

module.exports = router;
