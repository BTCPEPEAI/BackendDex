require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const adsRoutes = require('./routes/ads');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'));

// Routes
const coinRoutes = require('./routes/coinRoutes');
app.use('/api/coins', coinRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

// After other routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallet', walletRoutes);

const { startPriceUpdater } = require('./jobs/priceUpdater');
startPriceUpdater(); // 👈 Start live price updates

app.use('/api/homepage', require('./routes/homepageRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api/dex-data', require('./routes/dexRoutes'));

app.use('/api/token-info', require('./routes/tokenInfoRoutes'));

app.use('/api/coin-metrics', require('./routes/coinMetricsRoutes'));

app.use('/api/token-stats', require('./routes/tokenStatsRoutes'));

app.use('/api/wallet', require('./routes/walletRoutes'));

app.use('/api/coin', require('./routes/coinRoutes'));


mongoose.connect('mongodb://localhost:27017/crypto-platform');

app.use('/api/admin', adminRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));


const trendingCoinsRoutes = require('./routes/trendingCoins');
app.use('/api/trending-coins', trendingCoinsRoutes);



mongoose.connect('mongodb://localhost:27017/yourdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use ads route
app.use('/api/ads', adsRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

const usersRoutes = require('./routes/users');
const appsRoutes = require('./routes/applications');

app.use('/api/users', usersRoutes);
app.use('/api/applications', appsRoutes);


const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const walletRoutes = require('./routes/walletRoutes')
app.use('/api/wallet', walletRoutes)
