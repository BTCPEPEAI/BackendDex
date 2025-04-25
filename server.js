// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
module.exports.io = io;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
  
  // Start background jobs after DB connection
  require('./services/solanaService').fetchSolanaTokenList();
  require('./jobs/pairWatcher').watchPairs();
}).catch((err) => console.error('❌ MongoDB error:', err));

// WebSocket logic
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Import and use routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/coins', require('./routes/coinRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/homepage', require('./routes/homepageRoutes'));
app.use('/api/dex-data', require('./routes/dexRoutes'));
app.use('/api/token-info', require('./routes/tokenInfoRoutes'));
app.use('/api/coin-metrics', require('./routes/coinMetricsRoutes'));
app.use('/api/token-stats', require('./routes/tokenStatsRoutes'));
app.use('/api/trending-coins', require('./routes/trendingCoins'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/indexer', require('./routes/indexerRoutes'));
app.use('/api', require('./routes/indexRoutes'));
app.use('/api/candles', require('./routes/candleRoutes'));
app.use('/api/gainers', require('./routes/gainers'));
app.use('/api/chart', require('./routes/chartRoutes'));
app.use('/api/trending', require('./routes/trendingRoutes'));
app.use('/api/scan', require('./routes/tokenScanRoutes'));

// Background jobs
require('./jobs/priceUpdater').startPriceUpdater();
require('./jobs/candleUpdater').updateCandles();
setInterval(() => require('./jobs/candleUpdater').updateCandles(), 60000);
require('./jobs/tradeListener').startTradeListener();
require('./jobs/index'); // Add other jobs here

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
