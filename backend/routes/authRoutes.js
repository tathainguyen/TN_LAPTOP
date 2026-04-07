import { Router } from 'express';

import {
	login,
	register,
	sendEmailVerification,
	verifyEmail,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-verification-email', sendEmailVerification);
router.get('/verify-email', verifyEmail);

export default router;