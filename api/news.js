const axios = require('axios');
const cheerio = require('cheerio');

class CNNNews {
    constructor() {
        this.baseUrl = 'https://www.cnnindonesia.com';
    }

    async scrape() {
        try {
            const homeResponse = await axios.get(this.baseUrl);
            const $ = cheerio.load(homeResponse.data);
            const newsList = [];

            $('.nhl-list article').each((i, el) => {
                const article = $(el);
                const link = article.find('a').first();
                const url = link.attr('href');

                if (url && url !== '#') {
                    newsList.push({
                        url: url,
                        title: link.find('h2').text().trim(),
                        image: article.find('img').attr('src') || '',
                        category: article.find('.text-cnn_red').first().text().trim() || 'General'
                    });
                }
            });

            const results = [];
            // Mengambil 6 berita agar UI terlihat penuh
            for (const item of newsList.slice(0, 6)) {
                try {
                    const articleResponse = await axios.get(item.url);
                    const $$ = cheerio.load(articleResponse.data);
                    const content = [];

                    $$('.detail-text p').each((i, el) => {
                        const text = $$(el).text().trim();
                        if (text && !text.includes('BACA JUGA:')) content.push(text);
                    });

                    // Fallback image jika kosong
                    const finalImage = item.image || 'https://via.placeholder.com/800x450?text=No+Image';

                    results.push({
                        news: {
                            title: item.title,
                            url: item.url,
                            image: finalImage,
                            category: item.category
                        },
                        detail: {
                            title: $$('h1').text().trim() || item.title,
                            date: $$('.text-cnn_grey.text-sm').first().text().trim() || 'Baru saja',
                            author: $$('.text-cnn_red').first().text().trim() || 'Redaksi',
                            content: content.slice(0, 3), // Ambil 3 paragraf
                            tags: $$('.flex.flex-wrap.gap-3 a').map((i, el) => $$(el).text().trim()).get().slice(0, 3)
                        }
                    });
                } catch (err) {
                    console.error("Error scraping detail:", err.message);
                    continue;
                }
            }

            return { news: results };

        } catch (error) {
            console.error("Scraping error:", error);
            return { news: [] };
        }
    }
}

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    const scraper = new CNNNews();
    const result = await scraper.scrape();
    
    // Set Cache headers agar tidak terlalu sering request ke CNN (Cache 10 menit)
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json(result);
};
