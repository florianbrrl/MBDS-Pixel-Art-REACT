import { PixelHistory } from '@prisma/client';
import prisma from '../db/client';

/**
 * Interface représentant les données requises pour créer une nouvelle entrée d'historique de pixel
 */
export interface IPixelHistoryCreate {
	board_id: string;
	x: number;
	y: number;
	color: string;
	user_id?: string;
}

/**
 * Classe modèle PixelHistory pour les opérations de base de données
 */
export class PixelHistoryModel {
	/**
	 * Obtenir l'historique des pixels pour un tableau spécifique
	 * @param boardId - L'UUID du tableau
	 * @returns Tableau des entrées d'historique de pixels
	 */
	static async findByBoardId(boardId: string): Promise<PixelHistory[]> {
		return prisma.pixelHistory.findMany({
			where: { board_id: boardId },
			orderBy: { timestamp: 'desc' },
		});
	}

	/**
	 * Obtenir l'historique des pixels pour un utilisateur spécifique
	 * @param userId - L'UUID de l'utilisateur
	 * @returns Tableau des entrées d'historique de pixels
	 */
	static async findByUserId(userId: string): Promise<PixelHistory[]> {
		return prisma.pixelHistory.findMany({
			where: { user_id: userId },
			orderBy: { timestamp: 'desc' },
		});
	}

	/**
	 * Obtenir l'historique des pixels pour une coordonnée spécifique sur un tableau
	 * @param boardId - L'UUID du tableau
	 * @param x - Coordonnée X
	 * @param y - Coordonnée Y
	 * @returns Tableau des entrées d'historique de pixels
	 */
	static async findByCoordinate(boardId: string, x: number, y: number): Promise<PixelHistory[]> {
		return prisma.pixelHistory.findMany({
			where: { board_id: boardId, x, y },
			orderBy: { timestamp: 'desc' },
		});
	}

	/**
	 * Créer une nouvelle entrée d'historique de pixel
	 * @param data - Données de création d'historique
	 * @returns L'entrée d'historique de pixel créée
	 */
	static async create(data: IPixelHistoryCreate): Promise<PixelHistory> {
		return prisma.pixelHistory.create({
			data: {
				...data,
				timestamp: new Date(),
			},
		});
	}
}
