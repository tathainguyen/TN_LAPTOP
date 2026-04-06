import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import cloudinary from '../config/cloudinary.js';

const productImageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'tn-laptop/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `product-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
  }),
});

export const uploadProductImages = multer({
  storage: productImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});
