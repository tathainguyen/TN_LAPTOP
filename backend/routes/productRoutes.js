import { Router } from 'express';

import {
	createGroup,
	createSku,
	deleteSku,
	getGroups,
	getProductByIdDetail,
	getProductDetail,
	getProductMasterData,
	getProducts,
	toggleSkuStatus,
	updateSku,
} from '../controllers/productController.js';

const router = Router();

router.get('/admin/master-data', getProductMasterData);
router.get('/admin/groups', getGroups);
router.post('/admin/groups', createGroup);
router.get('/admin/:id', getProductByIdDetail);
router.post('/admin', createSku);
router.put('/admin/:id', updateSku);
router.patch('/admin/:id/status', toggleSkuStatus);
router.delete('/admin/:id', deleteSku);

router.get('/', getProducts);
router.get('/:slug', getProductDetail);

export default router;
