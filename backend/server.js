

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { testConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API TN Laptop đang hoạt động.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  console.error('❌ Lỗi hệ thống:', err);
  res.status(500).json({
    status: 'error',
    message: 'Đã xảy ra lỗi hệ thống.',
    data: null,
  });
});

async function startServer() {
  try {
    await testConnection();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log(`🚀 Server TN Laptop đang chạy tại cổng ${PORT}`);
      console.log(`🌐 Truy cập: http://localhost:${PORT}`);
      console.log('🔐 Auth routes: POST /api/auth/register | POST /api/auth/login');
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server hoặc kết nối MySQL thất bại:', error.message);
    process.exit(1);
  }
}

startServer();