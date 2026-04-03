const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API TN Laptop đang hoạt động.',
    status: 'success',
  });
});

async function startServer() {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`🚀 Server TN Laptop đang chạy tại cổng ${PORT}`);
    console.log('🌐 Truy cập: http://localhost:' + PORT);
    console.log('========================================');
  });

  try {
    await testConnection();
  } catch (error) {
    console.error('❌ Kết nối MySQL thất bại:', error.message);
  }
}

startServer();