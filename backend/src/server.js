require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`FoodRescue Backend running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
