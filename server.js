// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Core dependencies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// Route imports
import coinRoutes from './routes/coinRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adsRoutes from './routes/ads.js';
import walletRoutes from './routes/walletRoutes.js';
import homepageRoutes from './routes/homepageRoutes.js';
import dexRoutes from './routes/dexRoutes.js';
import tokenInfoRoutes from './routes/tokenInfoRoutes.js';
import coinMetricsRoutes from './routes/coinMetricsRoutes.js';
import tokenStatsRoutes from './routes/tokenStatsRoutes.js';
import trendingCoinsRoutes from './routes/trendingCoins.js';
import usersRoutes from './routes/users.js';
import applicationsRoutes from './routes/applications.js';
import indexerRoutes from './routes/indexerRoutes.js';
import candleRoutes from './routes/candleRoutes.js';
import gainersRoutes from './routes/gainers.js';
import chartRoutes from './routes/chartRoutes.js';
import tokenScanRoutes from './routes/tokenScanRoutes.js';
import autoCategoryRoutes from './routes/autoCategory.js';

// Job imports
import { startPriceUpdater } from './jobs/priceUpdater.js';
import { startCandleUpdater, repeatCandleUpdater } from './jobs/candleUpdater.js';
import { startTradeListener } from './jobs/tradeListener.js';
import { startCoinFetcher } from './jobs/coinFetcher.js';
import { startCoinIndexer } from './jobs/coinIndexer.js';
import { updateCategories } from './jobs/categoryUpdater.js';

// Initialize Express app & server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Export io if needed elsewhere
export { io };

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');

  // Background jobs after DB connection
  import('./services/solanaService.js').then(module => module.fetchSolanaTokenList());
  import('./jobs/pairWatcher.js').then(module => module.watchPairs());
})
.catch((err) => console.error('❌ MongoDB error:', err));

// WebSocket logic
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// API Routes
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

// Background Jobs
startCoinFetcher();
startPriceUpdater();
startTradeListener();
startCandleUpdater();
repeatCandleUpdater();
startCoinIndexer();
updateCategories();
setInterval(updateCategories, 2 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
