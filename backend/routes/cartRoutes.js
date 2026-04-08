import { Router } from 'express';

import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  syncGuestCart,
  updateCartItem,
} from '../controllers/cartController.js';

const router = Router();

router.get('/', getCart);
router.post('/items', addCartItem);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.post('/sync', syncGuestCart);
router.post('/clear', clearCart);

export default router;
