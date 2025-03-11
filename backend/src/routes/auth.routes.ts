import { Router, Request, Response } from 'express';
import { register, login } from '../controllers/auth.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Protected profile route
router.get('/profile', authenticateToken, restrictTo('user', 'premium', 'admin'), (req: Request, res: Response) => {
	res.status(200).json({
		status: 'success',
		data: { userId: req.user?.id, role: req.user?.role },
		message: 'Profile accessed successfully',
	});
});

export default router;