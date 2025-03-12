import { User } from '@prisma/client';
import { UserModel } from '../models/user.model';
import { PixelHistoryModel } from '../models/pixel-history.model';
import { AppErrorClass } from '../middleware/errorHandler.middleware';
import { hashPassword, comparePassword } from '../utils/security';

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
	 * Change le mot de passe d'un utilisateur
	 * @param userId - ID de l'utilisateur
	 * @param currentPassword - Mot de passe actuel
	 * @param newPassword - Nouveau mot de passe
	 * @returns L'utilisateur mis à jour
	 */
	static async changePassword(
		userId: string,
		currentPassword: string,
		newPassword: string
	): Promise<User> {
		// Récupérer l'utilisateur avec son mot de passe actuel
		const user = await this.getUserById(userId);

		// Vérifier que le mot de passe actuel est correct
		const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
		if (!isPasswordValid) {
			throw new AppErrorClass('Mot de passe actuel incorrect', 400);
		}

		// Hacher le nouveau mot de passe
		const newPasswordHash = await hashPassword(newPassword);

		// Mettre à jour le mot de passe
		return UserModel.update(userId, {
			password_hash: newPasswordHash,
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
