// ✅ Load environment variables
require('dotenv').config();

// ✅ Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// ✅ Route imports
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
const applicationsRoutes = require('./routes/applications');
const indexerRoutes = require('./routes/indexerRoutes');
const candleRoutes = require('./routes/candleRoutes');
const gainersRoutes = require('./routes/gainers');
const chartRoutes = require('./routes/chartRoutes');
const tokenScanRoutes = require('./routes/tokenScanRoutes');
const autoCategoryRoutes = require('./routes/autoCategory');

// ✅ Jobs (background tasks)
const { startJobs } = require('./jobs/index');

// ✅ Initialize Express app
const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
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

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');

    // Start background jobs only after DB connects
    try {
      require('./services/solanaService').fetchSolanaTokenList();
      require('./jobs/pairWatcher').watchPairs();
      startJobs();
    } catch (error) {
      console.error('❌ Error initializing background jobs:', error);
    }
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ✅ Solana token import endpoint (temporary, delete later)
const { importSolanaTokens } = require('./jobs/solanaImporter');
app.get('/api/import-solana', async (req, res) => {
  try {
    await importSolanaTokens();
    res.send('✅ Solana tokens imported and database cleaned.');
  } catch (error) {
    console.error('❌ Error importing Solana tokens:', error);
    res.status(500).send('❌ Failed to import Solana tokens.');
  }
});

const adsRoutes = require('./routes/adsRoutes');
app.use('/api/ads', adsRoutes);


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

// ✅ Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
