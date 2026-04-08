import { Router } from 'express';

import { getCheckoutData, placeCodOrder } from '../controllers/orderController.js';

const router = Router();

router.get('/checkout-data', getCheckoutData);
router.post('/cod', placeCodOrder);

export default router;
