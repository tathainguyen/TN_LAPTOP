import { Router } from 'express';

import {
	getCheckoutData,
	getCustomerOrders,
	placeCodOrder,
} from '../controllers/orderController.js';

const router = Router();

router.get('/customer', getCustomerOrders);
router.get('/checkout-data', getCheckoutData);
router.post('/cod', placeCodOrder);

export default router;
