import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../middleware/errorHandler.middleware';

/**
 * Contrôleur pour les opérations liées aux utilisateurs
 */
export class UserController {
	/**
	 * Récupérer le profil de l'utilisateur connecté
	 */
	static getProfile = catchAsync(async (req: Request, res: Response) => {
		// Dans une implémentation réelle avec authentification,
		// req.user contiendrait l'utilisateur authentifié
		// Pour l'instant, on utilise un ID temporaire en paramètre
		const userId = req.params.id || '1'; // À remplacer par req.user.id après implémentation de l'auth

		const user = await UserService.getUserById(userId);

		// Ne pas renvoyer le mot de passe dans la réponse
		const { password_hash, ...userWithoutPassword } = user;

		res.status(200).json({
			status: 'success',
			data: userWithoutPassword,
		});
	});

	/**
	 * Mettre à jour le profil de l'utilisateur connecté
	 */
	static updateProfile = catchAsync(async (req: Request, res: Response) => {
		// Dans une implémentation réelle, req.user contiendrait l'utilisateur authentifié
		const userId = req.params.id || '1'; // À remplacer par req.user.id après implémentation de l'auth

		const updatedUser = await UserService.updateUser(userId, req.body);

		// Ne pas renvoyer le mot de passe dans la réponse
		const { password_hash, ...userWithoutPassword } = updatedUser;

		res.status(200).json({
			status: 'success',
			data: userWithoutPassword,
		});
	});

	/**
	 * Récupérer les contributions d'un utilisateur
	 */
	static getUserContributions = catchAsync(async (req: Request, res: Response) => {
		const userId = req.params.id;

		const contributions = await UserService.getUserContributions(userId);

		res.status(200).json({
			status: 'success',
			data: contributions,
		});
	});
}
