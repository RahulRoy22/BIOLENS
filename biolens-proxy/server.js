import 'dotenv/config';
import express from 'express';
const app = express();

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error('FATAL: Set HF_TOKEN environment variable in .env or system env');
  process.exit(1);
}

app.use(express.json({ limit: '10mb' }));

const rateLimit = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60_000;
  const maxReqs = 20;
  const entry = rateLimit.get(ip);
  if (entry) {
    const recent = entry.filter((t) => now - t < windowMs);
    if (recent.length >= maxReqs) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    rateLimit.set(ip, [...recent, now]);
  } else {
    rateLimit.set(ip, [now]);
  }
  next();
});

app.post('/hf-inference/models/:model', async (req, res) => {
  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${req.params.model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy upstream failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`BioLens proxy on :${PORT}`));
