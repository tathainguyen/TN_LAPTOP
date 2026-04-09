import { Router } from 'express';

import {
  cancelCustomerOrder,
  getAdminOrdersList,
	getCheckoutData,
	getCustomerOrderDetail,
	getCustomerOrders,
	placeCodOrder,
  updateAdminOrderStatus,
} from '../controllers/orderController.js';

const router = Router();

router.get('/customer', getCustomerOrders);
router.get('/customer/:orderId', getCustomerOrderDetail);
router.patch('/customer/:orderId/cancel', cancelCustomerOrder);
router.get('/admin', getAdminOrdersList);
router.get('/checkout-data', getCheckoutData);
router.post('/cod', placeCodOrder);
router.patch('/admin/:id/status', updateAdminOrderStatus);

export default router;
