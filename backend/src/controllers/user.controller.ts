import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import { UserService } from '../services/user.service';

export class UserController {
	/**
	 * Récupère le profil de l'utilisateur connecté
	 */
	static getProfile = catchAsync(async (req: Request, res: Response) => {
		if (!req.user || !req.user.id) {
			throw new AppErrorClass('Not authenticated', 401);
		}

		const userId = req.user.id;
		const user = await UserService.getUserById(userId);

		// Ne pas renvoyer le mot de passe dans la réponse
		const { password_hash, ...userWithoutPassword } = user;

		res.status(200).json({
			status: 'success',
			data: userWithoutPassword,
		});
	});

	/**
	 * Met à jour le profil de l'utilisateur connecté
	 */
	static updateProfile = catchAsync(async (req: Request, res: Response) => {
		if (!req.user || !req.user.id) {
			throw new AppErrorClass('Not authenticated', 401);
		}

		const userId = req.user.id;

		// Valider les données de la requête
		const { email, theme_preference } = req.body;

		// Vérifier que theme_preference est valide si fourni
		if (theme_preference && !['light', 'dark', 'sys'].includes(theme_preference)) {
			throw new AppErrorClass(
				'Invalid theme preference. Must be "light", "dark", or "sys"',
				400
			);
		}

		// Données à mettre à jour
		const updateData: any = {};
		if (email) updateData.email = email;
		if (theme_preference) updateData.theme_preference = theme_preference;

		const updatedUser = await UserService.updateUser(userId, updateData);

		// Ne pas renvoyer le mot de passe dans la réponse
		const { password_hash, ...userWithoutPassword } = updatedUser;

		res.status(200).json({
			status: 'success',
			data: userWithoutPassword,
		});
	});

	/**
	 * Récupère les contributions d'un utilisateur
	 */
	static getUserContributions = catchAsync(async (req: Request, res: Response) => {
		const userId = req.params.id || (req.user ? req.user.id : null);

		if (!userId) {
			throw new AppErrorClass('User ID is required', 400);
		}

		const contributions = await UserService.getUserContributions(userId);

		res.status(200).json({
			status: 'success',
			data: contributions,
		});
	});

	/**
	 * Met à jour les préférences de thème de l'utilisateur
	 */
	static updateTheme = catchAsync(async (req: Request, res: Response) => {
		if (!req.user || !req.user.id) {
			throw new AppErrorClass('Not authenticated', 401);
		}

		const userId = req.user.id;
		const { theme } = req.body;

		if (!theme || !['light', 'dark', 'sys'].includes(theme)) {
			throw new AppErrorClass(
				'Invalid theme preference. Must be "light", "dark", or "sys"',
				400
			);
		}

		const updatedUser = await UserService.updateUser(userId, { theme_preference: theme });

		res.status(200).json({
			status: 'success',
			data: { theme: updatedUser.theme_preference },
		});
	});
}
