import { Router } from 'express';

import {
  getAdminOrdersList,
	getCheckoutData,
	getCustomerOrders,
	placeCodOrder,
  updateAdminOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.get('/customer', getCustomerOrders);
router.get('/admin', getAdminOrdersList);
router.get('/checkout-data', getCheckoutData);
router.post('/cod', placeCodOrder);
router.patch('/admin/:id/status', updateAdminOrderStatus);

export default router;
