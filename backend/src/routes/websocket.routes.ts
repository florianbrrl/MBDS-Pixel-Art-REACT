import { Router } from 'express';
import { WebSocketController } from '../controllers/websocket.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: WebSocket
 *   description: Opérations liées aux connexions WebSocket et statistiques en temps réel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardConnectionStats:
 *       type: object
 *       required:
 *         - boardId
 *         - activeConnections
 *       properties:
 *         boardId:
 *           type: string
 *           format: uuid
 *           description: Identifiant unique du PixelBoard
 *         activeConnections:
 *           type: integer
 *           minimum: 0
 *           description: Nombre de connexions WebSocket actives sur ce tableau
 */

/**
 * @swagger
 * /websocket/stats:
 *   get:
 *     summary: Récupérer les statistiques de connexion WebSocket pour tous les tableaux
 *     tags: [WebSocket]
 *     responses:
 *       200:
 *         description: Liste des statistiques de connexion pour chaque tableau
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BoardConnectionStats'
 */
router.get('/stats', WebSocketController.getAllConnectionStats);

/**
 * @swagger
 * /websocket/stats/{id}:
 *   get:
 *     summary: Récupérer les statistiques de connexion WebSocket pour un tableau spécifique
 *     tags: [WebSocket]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       200:
 *         description: Statistiques de connexion pour le tableau spécifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/BoardConnectionStats'
 */
router.get('/stats/:id', WebSocketController.getBoardConnectionStats);

export default router;