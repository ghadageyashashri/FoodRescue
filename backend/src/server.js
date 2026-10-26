require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start HTTP server immediately so health checks pass on cloud platforms (Render)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`FoodRescue Backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Listening on port ${PORT}`);
  console.log(`API Base URL: http://0.0.0.0:${PORT}/api/v1`);
  console.log(`===============================================`);
});

// Connect to MongoDB
connectDB().catch((err) => {
  console.error(`[MongoDB Startup Warning] Connection attempt failed: ${err.message}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
