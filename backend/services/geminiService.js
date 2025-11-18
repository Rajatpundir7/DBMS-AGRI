const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Gemini API Service for crop disease diagnosis
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA4z8lcGJeQmCzwUiyNNvFg5O98PongFsM';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  }

  // Convert image file to base64
  async imageToBase64(imagePath) {
    try {
      // Handle both absolute and relative paths
      let fullPath = imagePath;
      if (!path.isAbsolute(imagePath)) {
        // If it's a relative path from uploads, make it absolute
        if (imagePath.includes('uploads')) {
          // Remove leading slash if present and join
          const cleanPath = imagePath.replace(/^\/+/, '').replace(/^uploads\//, '');
          fullPath = path.join(__dirname, '../uploads', cleanPath);
        } else {
          fullPath = path.join(__dirname, '../uploads', imagePath);
        }
      }

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Image file not found: ${fullPath}`);
      }

      const imageBuffer = fs.readFileSync(fullPath);
      const base64Data = imageBuffer.toString('base64');
      
      // Determine MIME type
      const ext = path.extname(fullPath).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.webp') mimeType = 'image/webp';

      return { base64Data, mimeType };
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  // Analyze crop images using Gemini API
  async analyzeCropImages(imagePaths, cropName) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      if (!imagePaths || imagePaths.length === 0) {
        throw new Error('No images provided');
      }

      const systemInstruction = {
        parts: [{
          text: "You are a world-class plant pathologist and agricultural expert. You are analyzing images of crops to provide accurate disease diagnosis and actionable, non-pesticide-intensive treatment plans."
        }]
      };

      const userPrompt = `
        Analyze the provided images of the **${cropName}** crop. 

        IMPORTANT: You MUST provide the answer in Hinglish (a mix of Hindi and English using Roman script), so it is easy for a farmer to understand. For example: "Yeh 'Bacterial Spot' bimari hai. Paani kam dijiye."

        1. Identify the most likely disease, pest, or deficiency present (in Hinglish).
        2. Then, provide a concise action plan or recommendation to treat the issue (in Hinglish).

        Structure your answer clearly with the following headings:
        # Diagnosis (Bimari ka Pata)
        # Recommendation (Upay)
      `;

      const contents = [{ parts: [{ text: userPrompt }] }];

      // Add images to the request
      for (const imagePath of imagePaths) {
        try {
          const { base64Data, mimeType } = await this.imageToBase64(imagePath);
          contents.push({
            parts: [{
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }]
          });
        } catch (error) {
          console.error(`Error processing image ${imagePath}:`, error);
          // Continue with other images
        }
      }

      const payload = {
        contents: contents,
        systemInstruction: systemInstruction
      };

      const url = `${this.apiUrl}?key=${this.apiKey}`;
      
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = response.data;
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        // Parse the response to extract diagnosis and recommendations
        const diagnosisMatch = text.match(/#\s*Diagnosis[^\n]*\n([\s\S]*?)(?=#|$)/i);
        const recommendationMatch = text.match(/#\s*Recommendation[^\n]*\n([\s\S]*?)(?=#|$)/i);

        return {
          success: true,
          fullText: text,
          diagnosis: diagnosisMatch ? diagnosisMatch[1].trim() : text.split('\n')[0],
          recommendation: recommendationMatch ? recommendationMatch[1].trim() : text,
          language: 'hinglish'
        };
      } else {
        throw new Error('No response text from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      
      // Return fallback response
      return {
        success: false,
        error: error.message,
        diagnosis: 'Analysis temporarily unavailable. Please try again later.',
        recommendation: 'Please consult with a local agricultural expert.',
        language: 'hinglish'
      };
    }
  }
}

module.exports = new GeminiService();

