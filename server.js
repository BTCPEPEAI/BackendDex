// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const adsRoutes = require('./routes/ads');
const coinRoutes = require('./routes/coinRoutes');
const walletRoutes = require('./routes/walletRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const dexRoutes = require('./routes/dexRoutes');
const tokenInfoRoutes = require('./routes/tokenInfoRoutes');
const coinMetricsRoutes = require('./routes/coinMetricsRoutes');
const tokenStatsRoutes = require('./routes/tokenStatsRoutes');
const trendingCoinsRoutes = require('./routes/trendingCoins');
const usersRoutes = require('./routes/users');
const appsRoutes = require('./routes/applications');

// App init
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/dex-data', dexRoutes);
app.use('/api/token-info', tokenInfoRoutes);
app.use('/api/coin-metrics', coinMetricsRoutes);
app.use('/api/token-stats', tokenStatsRoutes);
app.use('/api/trending-coins', trendingCoinsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/applications', appsRoutes);

// Live price updater job
const { startPriceUpdater } = require('./jobs/priceUpdater');
startPriceUpdater(); // ⏱️ Starts the background job

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


