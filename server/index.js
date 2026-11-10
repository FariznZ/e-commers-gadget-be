'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ---- Global middleware ----
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// ---- Health check ----
app.get('/', (req, res) => {
  res.status(200).json({ data: { status: 'ok', service: 'ecommerce-api' } });
});

// ---- Routes ----
// products + categories (public)
app.use('/api', productRoutes);
// orders (protected)
app.use('/api/orders', orderRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// ---- Error handler (includes invalid JSON body) ----
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body bukan JSON yang valid' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`E-Commerce API running on http://localhost:${PORT}`);
});
