require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/receipt', require('./routes/receipts'));

// WHY: Expose analytics under /api/analytics/:id as a clean URL for frontend,
// reusing the same controller without duplicating code
const { getAnalytics } = require('./controllers/receiptController');
app.get('/api/analytics/:campaignId', getAnalytics);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'xeno-crm-backend' }));

// Global error handler
// WHY: Centralised error format so frontend always gets { error, details }
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ CRM Backend running on port ${PORT}`));
