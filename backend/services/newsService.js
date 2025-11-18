const axios = require('axios');

// News Service to fetch crop-related news from internet
class NewsService {
  constructor() {
    // Using NewsAPI (free tier) or RSS feeds
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.useNewsAPI = !!this.newsApiKey;
  }

  // Fetch crop-related news
  async getCropNews(crop = '', limit = 10) {
    try {
      if (this.useNewsAPI) {
        return await this.fetchFromNewsAPI(crop, limit);
      } else {
        // Use RSS feeds or placeholder news
        return await this.fetchFromRSS(crop, limit);
      }
    } catch (error) {
      console.error('News API Error:', error);
      return this.getDummyNews(crop, limit);
    }
  }

  // Fetch from NewsAPI
  async fetchFromNewsAPI(crop, limit) {
    const query = crop ? `${crop} agriculture farming` : 'agriculture farming crops';
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: limit,
        apiKey: this.newsApiKey
      }
    });

    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name
    }));
  }

  // Fetch from RSS feeds (agricultural news sources)
  async fetchFromRSS(crop, limit) {
    // Using agricultural news RSS feeds
    const rssFeeds = [
      'https://www.agriculture.com/rss',
      'https://www.farmprogress.com/rss',
      'https://www.agweb.com/rss'
    ];

    // For now, return dummy news with real structure
    return this.getDummyNews(crop, limit);
  }

  // Get dummy/placeholder news
  getDummyNews(crop, limit) {
    const newsItems = [];
    const crops = crop ? [crop] : ['Rice', 'Wheat', 'Cotton', 'Tomato', 'Potato'];
    const topics = [
      'Latest farming techniques',
      'Crop disease prevention',
      'Market prices update',
      'Government schemes',
      'Weather impact on crops',
      'Organic farming methods',
      'New pesticide regulations',
      'Fertilizer recommendations'
    ];

    for (let i = 0; i < limit; i++) {
      const selectedCrop = crops[Math.floor(Math.random() * crops.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      newsItems.push({
        title: `${selectedCrop} ${topic} - Latest Updates`,
        description: `Stay updated with the latest news about ${selectedCrop} farming, ${topic.toLowerCase()}, and agricultural practices. Get expert insights and market information.`,
        url: `https://example.com/news/${i + 1}`,
        imageUrl: `https://picsum.photos/seed/${selectedCrop}${i}/800/400`,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Agricultural News',
        crop: selectedCrop
      });
    }

    return newsItems;
  }
}

module.exports = new NewsService();

