import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import apiRouter from './api/index.js';

const app = express();

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mypick.trevo.studio',
];
const corsOrigins = parseOrigins(process.env.CORS_ORIGINS);

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : defaultCorsOrigins,
  credentials: true,
}));

app.use(express.json());

app.use('/api', apiRouter);

app.get('/products', (req, res) => {
  res.redirect(`/api/client/products${req.url.substring('/products'.length)}`);
});

app.get('/', (req, res) => {
  res.send('MyPick commerce bridge is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyPick commerce bridge listening on http://0.0.0.0:${PORT}`);
});
