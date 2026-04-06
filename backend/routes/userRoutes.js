import { Router } from 'express';

import {
  createUserItem,
  getUserByIdDetail,
  getUserList,
  getUserMasterData,
  toggleUserStatus,
  updateUserItem,
  updateUserProfileItem,
  changeUserPassword,
} from '../controllers/userController.js';
import {
  getAddressList,
  createAddressItem,
  updateAddressItem,
  deleteAddressItem,
} from '../controllers/addressController.js';

const router = Router();

// Admin user routes
router.get('/admin/master-data', getUserMasterData);
router.get('/admin', getUserList);
router.post('/admin', createUserItem);
router.get('/admin/:id', getUserByIdDetail);
router.put('/admin/:id', updateUserItem);
router.patch('/admin/:id/status', toggleUserStatus);

// Customer profile routes
router.put('/customer/:userId/profile', updateUserProfileItem);
router.post('/customer/:userId/password', changeUserPassword);

// Address routes
router.get('/customer/:userId/addresses', getAddressList);
router.post('/customer/:userId/addresses', createAddressItem);
router.put('/customer/:userId/addresses/:addressId', updateAddressItem);
router.delete('/customer/:userId/addresses/:addressId', deleteAddressItem);

export default router;
