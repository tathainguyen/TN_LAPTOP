import { Router } from 'express';

import {
  createBrandItem,
  createCategoryItem,
  deleteBrandItem,
  deleteCategoryItem,
  getBrandList,
  getCategoryList,
  toggleBrandItemStatus,
  toggleCategoryItemStatus,
  updateBrandItem,
  updateCategoryItem,
} from '../controllers/catalogController.js';

const router = Router();

router.get('/brands', getBrandList);
router.post('/brands', createBrandItem);
router.put('/brands/:id', updateBrandItem);
router.patch('/brands/:id/status', toggleBrandItemStatus);
router.delete('/brands/:id', deleteBrandItem);

router.get('/categories', getCategoryList);
router.post('/categories', createCategoryItem);
router.put('/categories/:id', updateCategoryItem);
router.patch('/categories/:id/status', toggleCategoryItemStatus);
router.delete('/categories/:id', deleteCategoryItem);

export default router;
