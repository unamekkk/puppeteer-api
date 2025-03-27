const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('✅ Puppeteer API đang chạy!');
});

app.get('/yy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Thiếu tham số ?url=' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
      const parseNumber = (str) => {
        if (!str) return '';
        const multiplier = str.includes('K') ? 1000 : str.includes('M') ? 1000000 : 1;
        return parseFloat(str.replace(/[KM,.]/g, '')) * multiplier;
      };

      const ratingElement = document.querySelector('.rating-score .num');
      const rating = ratingElement ? parseFloat(ratingElement.textContent) : '';

      const ratingCountElement = document.querySelector('.rating-score small');
      const ratingCount = ratingCountElement ? parseInt(ratingCountElement.textContent.replace(/\D/g, '')) : '';

      const list = document.querySelectorAll('ul.numbers li');
      let views = '', likes = '';

      list.forEach(li => {
        const small = li.querySelector('small')?.textContent.trim();
        const span = li.querySelector('span')?.textContent.trim();
        if (small === 'Lượt Xem') views = parseNumber(span);
        if (small === 'Lượt Thích') likes = parseNumber(span);
      });

      return {
        rating,
        ratingCount,
        views,
        likes,
      };
    });

    await browser.close();
    res.json(data);
  } catch (e) {
    res.status(500).send({ error: 'Lỗi khi crawl: ' + e.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
