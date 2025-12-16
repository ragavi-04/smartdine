require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'SmartDine API is running! 🍽️' });
});
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/search', require('./routes/search'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reviews', require('./routes/reviews'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});