
// server.js (Node.js Backend for eboardresults.com proxy with dynamic cookie refresh)
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let sessionCookies = {
  __nobotA2: '',
  EBRSESSID2: ''
};

async function refreshCookies() {
  try {
    const res = await axios.get('https://eboardresults.com/v2/home?lang=en');
    const setCookies = res.headers['set-cookie'];

    if (setCookies) {
      setCookies.forEach(cookie => {
        if (cookie.includes('__nobotA2=')) {
          sessionCookies.__nobotA2 = cookie.match(/__nobotA2=([^;]+)/)[1];
        }
        if (cookie.includes('EBRSESSID2=')) {
          sessionCookies.EBRSESSID2 = cookie.match(/EBRSESSID2=([^;]+)/)[1];
        }
      });
    }
  } catch (err) {
    console.error('Cookie refresh failed:', err.message);
  }
}

// Initial cookie fetch
refreshCookies();

// Periodic refresh every 10 minutes
setInterval(refreshCookies, 10 * 60 * 1000);

app.post('/get-result', async (req, res) => {
  const { exam, year, board, roll, reg, captcha } = req.body;

  const payload = new URLSearchParams({
    exam,
    year,
    board,
    result_type: '1',
    roll,
    reg,
    eiin: '',
    dcode: '',
    ccode: '',
    captcha
  });

  try {
    const response = await axios.post('https://eboardresults.com/v2/getres', payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `__nobotA2=${sessionCookies.__nobotA2}; EBRSESSID2=${sessionCookies.EBRSESSID2}`,
        'x-requested-with': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://eboardresults.com/v2/home?lang=en'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch result', details: error.message });
  }
});

app.get('/captcha', async (req, res) => {
  const t = Date.now();
  try {
    const captcha = await axios.get(`https://eboardresults.com/v2/captcha?t=${t}`, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://eboardresults.com/v2/home?lang=en'
      }
    });

    res.set('Content-Type', 'image/png');
    res.send(captcha.data);
  } catch (err) {
    res.status(500).send('Failed to load CAPTCHA');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
