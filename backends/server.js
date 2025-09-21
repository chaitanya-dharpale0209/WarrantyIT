const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routers/UserRoute');
const productRoutes = require('./routers/ProductRoute');
const { createIndexes } = require('./migrations/dbinit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
createIndexes().catch(console.error);
// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'API is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;