const path = require('path');

module.exports = async (req, res) => {
  try {
    const docxPath = path.join(process.cwd(), 'cloudlink.docx');
    let mammoth;
    try { mammoth = require('mammoth'); } catch (e) { console.warn('mammoth not installed'); return res.json({ success: true, images: [] }); }
    const result = await mammoth.extractRawText({ path: docxPath });
    const text = result.value || '';
    const urlRegex = /(https?:\/\/[^
\s)]+)/g;
    const matches = text.match(urlRegex) || [];
    const images = Array.from(new Set(matches));
    return res.json({ success: true, images });
  } catch (err) {
    console.error('docx images error', err.message || err);
    return res.status(500).json({ success: false, images: [], error: err.message });
  }
};
