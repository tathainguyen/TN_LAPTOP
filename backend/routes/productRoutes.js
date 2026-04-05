import { Router } from 'express';

import {
	createGroup,
	createSku,
	deleteGroup,
	deleteSku,
	getGroups,
	getProductByIdDetail,
	getProductDetail,
	getProductMasterData,
	getProducts,
	toggleGroupStatus,
	toggleSkuStatus,
	updateGroup,
	updateSku,
} from '../controllers/productController.js';

const router = Router();

router.get('/admin/master-data', getProductMasterData);
router.get('/admin/groups', getGroups);
router.post('/admin/groups', createGroup);
router.put('/admin/groups/:id', updateGroup);
router.patch('/admin/groups/:id/status', toggleGroupStatus);
router.delete('/admin/groups/:id', deleteGroup);
router.get('/admin/:id', getProductByIdDetail);
router.post('/admin', createSku);
router.put('/admin/:id', updateSku);
router.patch('/admin/:id/status', toggleSkuStatus);
router.delete('/admin/:id', deleteSku);

router.get('/', getProducts);
router.get('/:slug', getProductDetail);

export default router;
