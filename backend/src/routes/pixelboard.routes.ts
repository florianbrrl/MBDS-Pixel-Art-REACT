import { Router } from 'express';
import { PixelBoardController } from '../controllers/pixelboard.controller';
import { authenticateToken, restrictTo } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PixelBoards
 *   description: Opérations liées aux tableaux d'art pixel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PixelBoard:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - width
 *         - height
 *         - grid
 *         - start_time
 *         - end_time
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identifiant unique du PixelBoard
 *         title:
 *           type: string
 *           description: Titre du PixelBoard
 *         width:
 *           type: integer
 *           minimum: 10
 *           maximum: 1000
 *           description: Largeur du PixelBoard
 *         height:
 *           type: integer
 *           minimum: 10
 *           maximum: 1000
 *           description: Hauteur du PixelBoard
 *         grid:
 *           type: object
 *           description: Grille de pixels (format JSON)
 *         cooldown:
 *           type: integer
 *           default: 60
 *           description: Délai entre les placements de pixels (en secondes)
 *         allow_overwrite:
 *           type: boolean
 *           default: false
 *           description: Autorisation de remplacer les pixels existants
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Date de début du PixelBoard
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Date de fin du PixelBoard
 *         is_active:
 *           type: boolean
 *           description: Statut d'activité (calculé en fonction des dates)
 *         admin_id:
 *           type: string
 *           format: uuid
 *           description: ID de l'administrateur créateur
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date de création
 */

/**
 * @swagger
 * /pixelboards:
 *   get:
 *     summary: Récupérer tous les PixelBoards
 *     tags: [PixelBoards]
 *     responses:
 *       200:
 *         description: Liste des PixelBoards
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
 *                     $ref: '#/components/schemas/PixelBoard'
 */
router.get('/', PixelBoardController.getAllPixelBoards);

/**
 * @swagger
 * /pixelboards/active:
 *   get:
 *     summary: Récupérer uniquement les PixelBoards actifs
 *     tags: [PixelBoards]
 *     responses:
 *       200:
 *         description: Liste des PixelBoards actifs
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
 *                     $ref: '#/components/schemas/PixelBoard'
 */
router.get('/active', PixelBoardController.getActivePixelBoards);

/**
 * @swagger
 * /pixelboards/completed:
 *   get:
 *     summary: Récupérer uniquement les PixelBoards terminés
 *     tags: [PixelBoards]
 *     responses:
 *       200:
 *         description: Liste des PixelBoards terminés
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
 *                     $ref: '#/components/schemas/PixelBoard'
 */
router.get('/completed', PixelBoardController.getCompletedPixelBoards);

/**
 * @swagger
 * /pixelboards/{id}:
 *   get:
 *     summary: Récupérer un PixelBoard par son ID
 *     tags: [PixelBoards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       200:
 *         description: Détails du PixelBoard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PixelBoard'
 *       404:
 *         description: PixelBoard non trouvé
 */
router.get('/:id', PixelBoardController.getPixelBoardById);

// Routes protégées (requièrent l'authentification et le rôle 'admin')
router.use(authenticateToken);

/**
 * @swagger
 * /pixelboards:
 *   post:
 *     summary: Créer un nouveau PixelBoard
 *     tags: [PixelBoards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - width
 *               - height
 *               - start_time
 *               - end_time
 *             properties:
 *               title:
 *                 type: string
 *               width:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 1000
 *               height:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 1000
 *               cooldown:
 *                 type: integer
 *                 default: 60
 *               allow_overwrite:
 *                 type: boolean
 *                 default: false
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: PixelBoard créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PixelBoard'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (pas administrateur)
 */
router.post('/', restrictTo('admin'), PixelBoardController.createPixelBoard);

/**
 * @swagger
 * /pixelboards/{id}:
 *   put:
 *     summary: Mettre à jour un PixelBoard
 *     tags: [PixelBoards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               width:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 1000
 *               height:
 *                 type: integer
 *                 minimum: 10
 *                 maximum: 1000
 *               cooldown:
 *                 type: integer
 *               allow_overwrite:
 *                 type: boolean
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: PixelBoard mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PixelBoard'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: PixelBoard non trouvé
 */
router.put('/:id', restrictTo('admin'), PixelBoardController.updatePixelBoard);

/**
 * @swagger
 * /pixelboards/{id}:
 *   delete:
 *     summary: Supprimer un PixelBoard
 *     tags: [PixelBoards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du PixelBoard
 *     responses:
 *       204:
 *         description: PixelBoard supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: PixelBoard non trouvé
 */
router.delete('/:id', restrictTo('admin'), PixelBoardController.deletePixelBoard);

export default router;
