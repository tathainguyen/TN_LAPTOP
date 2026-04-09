import { Router } from 'express';

import {
  createShippingMethodController,
  createShippingCarrierController,
  deleteShippingCarrierController,
  deleteShippingMethod,
  getShippingCarriers,
  getShippingMethods,
  updateShippingMethod,
  updateShippingCarrierController,
} from '../controllers/shippingController.js';

const router = Router();

router.get('/methods', getShippingMethods);
router.post('/methods', createShippingMethodController);
router.put('/methods/:id', updateShippingMethod);
router.delete('/methods/:id', deleteShippingMethod);
router.get('/carriers', getShippingCarriers);
router.post('/carriers', createShippingCarrierController);
router.put('/carriers/:id', updateShippingCarrierController);
router.delete('/carriers/:id', deleteShippingCarrierController);

export default router;
