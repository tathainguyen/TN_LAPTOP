import { Router } from 'express';

import {
	forgotPassword,
	login,
	register,
	resetPassword,
	sendEmailVerification,
	verifyEmail,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-verification-email', sendEmailVerification);
router.get('/verify-email', verifyEmail);

export default router;