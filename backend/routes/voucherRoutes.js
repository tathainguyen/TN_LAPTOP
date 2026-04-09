import { Router } from 'express';

import {
  createVoucherCodeController,
  createVoucherTypeController,
  deleteVoucherCodeController,
  deleteVoucherTypeController,
  getVoucherCodes,
  getVoucherTypes,
  updateVoucherCodeController,
  updateVoucherTypeController,
} from '../controllers/voucherController.js';

const router = Router();

router.get('/types', getVoucherTypes);
router.post('/types', createVoucherTypeController);
router.put('/types/:id', updateVoucherTypeController);
router.delete('/types/:id', deleteVoucherTypeController);

router.get('/codes', getVoucherCodes);
router.post('/codes', createVoucherCodeController);
router.put('/codes/:id', updateVoucherCodeController);
router.delete('/codes/:id', deleteVoucherCodeController);

export default router;
