const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

let cookieSet = false;

app.get('/captcha', async (req, res) => {
  try {
    if (!cookieSet) {
      await client.get('https://eboardresults.com/v2/home');
      cookieSet = true;
    }
    const captchaUrl = `https://eboardresults.com/v2/captcha?t=${Date.now()}`;
    const response = await client.get(captchaUrl, {
      responseType: 'arraybuffer',
      headers: { Referer: 'https://eboardresults.com/v2/home?lang=en' }
    });
    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching CAPTCHA');
  }
});

app.post('/get-result', async (req, res) => {
  try {
    const { roll } = req.body;

    if (!roll) {
      return res.status(400).json({ error: 'Roll number is required' });
    }

    const data = new URLSearchParams({ roll }).toString();

    const response = await client.post('https://eboardresults.com/v2/getres', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://eboardresults.com/v2/home?lang=en'
      }
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return res.status(404).json({ error: 'Result not found with provided roll number' });
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Result fetch failed', detail: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
