document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
});

async function fetchNews() {
    const newsContainer = document.getElementById('news-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const trendingContainer = document.getElementById('trending-container');

    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        const newsData = data.news;

        loadingSpinner.style.display = 'none';

        if (!newsData || newsData.length === 0) {
            newsContainer.innerHTML = '<p style="padding:20px">Gagal memuat berita atau tidak ada berita ditemukan.</p>';
            return;
        }

        // Render Main News
        newsContainer.innerHTML = newsData.map(item => {
            // Gabungkan paragraf konten untuk preview
            const snippet = item.detail.content.join(' ').substring(0, 150) + '...';
            
            return `
            <article class="article-card">
                <div class="article-img">
                    <img src="${item.news.image}" alt="${item.news.title}" loading="lazy">
                </div>
                <div class="article-content">
                    <a href="${item.news.url}" target="_blank">
                        <h3>${item.detail.title}</h3>
                    </a>
                    <div class="article-meta">
                        <span class="category">${item.news.category}</span>
                        <span class="date">${item.detail.date}</span>
                        <span class="author">Oleh ${item.detail.author}</span>
                    </div>
                    <p class="article-excerpt">${snippet}</p>
                </div>
            </article>
            `;
        }).join('');

        // Render Sidebar Trending (Menggunakan data yang sama untuk demo)
        // Kita ambil judul saja untuk sidebar agar terlihat padat
        trendingContainer.innerHTML = newsData.slice(0, 5).map(item => {
            return `
            <div class="mini-news-item">
                <a href="${item.news.url}" target="_blank">
                    <h4>${item.news.title}</h4>
                </a>
                <span style="font-size:10px; color:#666;">${item.detail.date.split(' ')[0]}</span>
            </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        newsContainer.innerHTML = '<p style="padding:20px; color:red">Terjadi kesalahan saat memuat berita.</p>';
    }
}
