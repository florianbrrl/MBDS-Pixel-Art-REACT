import { User } from '@prisma/client';
import { UserModel } from '../models/user.model';
import { PixelHistoryModel } from '../models/pixel-history.model';
import { AppErrorClass } from '../middleware/errorHandler.middleware';

/**
 * Service pour la gestion des utilisateurs
 */
export class UserService {
	/**
	 * Récupère un utilisateur par son ID
	 * @param userId - ID de l'utilisateur à récupérer
	 * @returns L'utilisateur trouvé
	 */
	static async getUserById(userId: string): Promise<User> {
		const user = await UserModel.findById(userId);

		if (!user) {
			throw new AppErrorClass('Utilisateur non trouvé', 404);
		}

		return user;
	}

	/**
	 * Met à jour les informations d'un utilisateur
	 * @param userId - ID de l'utilisateur à mettre à jour
	 * @param userData - Données à mettre à jour
	 * @returns L'utilisateur mis à jour
	 */
	static async updateUser(userId: string, userData: Partial<User>): Promise<User> {
		// Vérifier si l'utilisateur existe
		await this.getUserById(userId);

		// Empêcher la mise à jour de certains champs sensibles
		const { password_hash, id, created_at, ...updateData } = userData as any;

		return UserModel.update(userId, {
			...updateData,
			updated_at: new Date(),
		});
	}

	/**
	 * Obtient les contributions d'un utilisateur
	 * @param userId - ID de l'utilisateur
	 * @returns Statistiques de contribution
	 */
	static async getUserContributions(userId: string): Promise<{
		totalPixels: number;
		contributedBoards: { boardId: string; pixelCount: number }[];
	}> {
		// Vérifier si l'utilisateur existe
		await this.getUserById(userId);

		// Récupérer l'historique des pixels de l'utilisateur
		const pixelHistory = await PixelHistoryModel.findByUserId(userId);

		// Calculer les statistiques
		const totalPixels = pixelHistory.length;

		// Grouper par tableau (board_id)
		const boardsMap = new Map<string, number>();
		pixelHistory.forEach(pixel => {
			const currentCount = boardsMap.get(pixel.board_id) || 0;
			boardsMap.set(pixel.board_id, currentCount + 1);
		});

		// Convertir en tableau pour le résultat
		const contributedBoards = Array.from(boardsMap.entries()).map(([boardId, pixelCount]) => ({
			boardId,
			pixelCount,
		}));

		return {
			totalPixels,
			contributedBoards,
		};
	}
}
