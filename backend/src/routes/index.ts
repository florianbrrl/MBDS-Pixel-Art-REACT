import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import pixelBoardRoutes from './pixelboard.routes';
import pixelRoutes from './pixel.routes';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - password_hash
 *         - created_at
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password_hash:
 *           type: string
 *           description: Hashed password (never returned in responses)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *         theme_preference:
 *           type: string
 *           enum: [light, dark, sys]
 *           default: sys
 *           description: User's preferred theme
 *         role:
 *           type: string
 *           enum: [user, premium, admin]
 *           default: user
 *           description: User's role for access control
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 *   - name: Users
 *     description: User profile and contribution operations
 *   - name: Admin
 *     description: Administrative operations
 *   - name: PixelBoards
 *     description: Operations related to pixel art boards
 *   - name: Pixels
 *     description: Operations related to pixel placement and history
 */

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Returns basic information about the API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: PixelBoard API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 apiDocs:
 *                   type: string
 *                   example: /api-docs
 */
router.get('/', (req: Request, res: Response) => {
	res.status(200).json({
		status: 'success',
		message: 'PixelBoard API',
		version: '1.0.0',
		apiDocs: '/api-docs',
	});
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes utilisateur
router.use('/users', userRoutes);

// Routes PixelBoard
router.use('/pixelboards', pixelBoardRoutes);

// Routes Pixel
router.use('/pixels', pixelRoutes);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Admin access check
 *     description: Endpoint to verify administrator access
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Admin access granted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (non-admin user)
 */
router.get('/admin', authenticateToken, restrictTo('admin'), (req: Request, res: Response) => {
	res.status(200).json({
		status: 'success',
		message: 'Admin access granted',
	});
});

export default router;
