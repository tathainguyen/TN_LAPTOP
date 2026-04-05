import { Router } from 'express';

import {
  createUserItem,
  getUserByIdDetail,
  getUserList,
  getUserMasterData,
  toggleUserStatus,
  updateUserItem,
} from '../controllers/userController.js';

const router = Router();

router.get('/admin/master-data', getUserMasterData);
router.get('/admin', getUserList);
router.post('/admin', createUserItem);
router.get('/admin/:id', getUserByIdDetail);
router.put('/admin/:id', updateUserItem);
router.patch('/admin/:id/status', toggleUserStatus);

export default router;
