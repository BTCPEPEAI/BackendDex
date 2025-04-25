// ✅ Load environment variables
require('dotenv').config();

// ✅ Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ✅ Route imports
const coinRoutes = require('./routes/coinRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adsRoutes = require('./routes/ads');
const walletRoutes = require('./routes/walletRoutes');
const homepageRoutes = require('./routes/homepageRoutes');
const dexRoutes = require('./routes/dexRoutes');
const tokenInfoRoutes = require('./routes/tokenInfoRoutes');
const coinMetricsRoutes = require('./routes/coinMetricsRoutes');
const tokenStatsRoutes = require('./routes/tokenStatsRoutes');
const trendingCoinsRoutes = require('./routes/trendingCoins');
const usersRoutes = require('./routes/users');
const applicationsRoutes = require('./routes/applications');
const indexerRoutes = require('./routes/indexerRoutes');
const candleRoutes = require('./routes/candleRoutes');
const gainersRoutes = require('./routes/gainers');
const chartRoutes = require('./routes/chartRoutes');
const tokenScanRoutes = require('./routes/tokenScanRoutes');

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

  // ✅ Background jobs after DB connection
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
app.use('/api/coin', coinRoutes); // ✅ Corrected — only one registration!
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

// ✅ Background jobs (launchers)
require('./jobs/priceUpdater').startPriceUpdater();
require('./jobs/candleUpdater').updateCandles();
setInterval(() => require('./jobs/candleUpdater').updateCandles(), 60000);
require('./jobs/tradeListener').startTradeListener();
require('./jobs/index');

// ✅ Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
