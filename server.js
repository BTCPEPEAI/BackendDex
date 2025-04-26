// ✅ Load environment variables
require('dotenv').config();

// ✅ Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ✅ Route imports
const adminRoutes = require('./routes/adminRoutes.js');
const adsRoutes = require('./routes/ads.js');
const coinRoutes = require('./routes/coinRoutes.js');
const walletRoutes = require('./routes/walletRoutes.js');
const homepageRoutes = require('./routes/homepageRoutes.js');
const dexRoutes = require('./routes/dexRoutes.js');
const tokenInfoRoutes = require('./routes/tokenInfoRoutes.js');
const coinMetricsRoutes = require('./routes/coinMetricsRoutes.js');
const tokenStatsRoutes = require('./routes/tokenStatsRoutes.js');
const trendingCoinsRoutes = require('./routes/trendingCoins.js');
const usersRoutes = require('./routes/users.js');
const applicationsRoutes = require('./routes/applications.js');
const indexerRoutes = require('./routes/indexerRoutes.js');
const candleRoutes = require('./routes/candleRoutes.js');
const gainersRoutes = require('./routes/gainers.js');
const chartRoutes = require('./routes/chartRoutes.js');
const tokenScanRoutes = require('./routes/tokenScanRoutes.js');
const autoCategoryRoutes = require('./routes/autoCategory.js');

// ✅ Initialize Express app & server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
module.exports.io = io;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  require('./services/solanaService').fetchSolanaTokenList();
  require('./jobs/pairWatcher').watchPairs();
})
.catch((err) => console.error('❌ MongoDB error:', err));

// ✅ WebSocket logic
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/coin', coinRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/dex-data', dexRoutes);
app.use('/api/token-info', tokenInfoRoutes);
app.use('/api/coin-metrics', coinMetricsRoutes);
app.use('/api/token-stats', tokenStatsRoutes);
app.use('/api/trending-coins', trendingCoinsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/indexer', indexerRoutes);
app.use('/api/candles', candleRoutes);
app.use('/api/gainers', gainersRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/scan', tokenScanRoutes);
app.use('/api/auto-category', autoCategoryRoutes);

// ✅ Background jobs (launchers)
require('./jobs/priceUpdater').startPriceUpdater();
require('./jobs/candleUpdater').updateCandles();
setInterval(() => require('./jobs/candleUpdater').updateCandles(), 60000);
require('./jobs/tradeListener').startTradeListener();
require('./jobs/index');
require('./jobs/coinFetcher').startCoinFetcher();
require('./jobs/coinIndexer');
require('./jobs/categoryUpdater').updateCategories();
setInterval(() => require('./jobs/categoryUpdater').updateCategories(), 2 * 60 * 1000);

// ✅ Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
