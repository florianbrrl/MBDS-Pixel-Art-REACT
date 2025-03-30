import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import { UserService } from '../services/user.service';
import { PixelHistoryModel } from '../models/pixel-history.model';

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
	 * Change le mot de passe d'un utilisateur
	 */
	static changePassword = catchAsync(async (req: Request, res: Response) => {
		if (!req.user || !req.user.id) {
			throw new AppErrorClass('Not authenticated', 401);
		}

		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;

		// Valider les données de la requête
		if (!currentPassword || !newPassword) {
			throw new AppErrorClass('Current password and new password are required', 400);
		}

		// Vérifier que le nouveau mot de passe a une longueur minimum
		if (newPassword.length < 8) {
			throw new AppErrorClass('New password must be at least 8 characters long', 400);
		}

		await UserService.changePassword(userId, currentPassword, newPassword);

		res.status(200).json({
			status: 'success',
			message: 'Password changed successfully',
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

	/**
	 * Récupérer les contributions temporelles de l'utilisateur connecté
	 */
	static getUserContributionTimeline = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user || !req.user.id) {
			return next(new AppErrorClass('Authentification requise', 401));
		}

		const userId = req.user.id;
		const timeRange = req.query.timeRange as string || 'all';
		const validTimeRanges = ['day', 'week', 'month', 'all'];

		if (!validTimeRanges.includes(timeRange)) {
			return next(new AppErrorClass('Plage de temps non valide', 400));
		}

		try {
			// Récupérer directement l'historique des pixels depuis le modèle PixelHistory
			const pixelHistory = await PixelHistoryModel.findByUserId(userId);

			// Calculer le total des pixels pour cette période
			const now = new Date();
			let startDate: Date = new Date(0); // Date très ancienne par défaut (pour "all")

			if (timeRange === 'day') {
			startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h
			} else if (timeRange === 'week') {
			startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 jours
			} else if (timeRange === 'month') {
			startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours
			}

			// Filtrer les pixels par période
			const filteredPixels = pixelHistory.filter(pixel =>
			new Date(pixel.timestamp) >= startDate
			);

			// Préparer les données de timeline
			const timelineData: { date: string; count: number }[] = [];

			if (timeRange === 'day') {
			 	// Grouper par heure
				const hourlyData: Record<string, number> = {};

				// Obtenir l'heure actuelle
				const currentDate = new Date();
				const currentHour = currentDate.getHours();

				// Initialiser les 24 dernières heures (en partant de l'heure actuelle)
				for (let i = 0; i < 24; i++) {
					// Calculer l'heure en remontant de i heures en arrière
					const hourOffset = (currentHour - i + 24) % 24;
					const hourKey = `${hourOffset}:00`;
					hourlyData[hourKey] = 0;
				}

				// Compter les pixels par heure
				filteredPixels.forEach(pixel => {
					const pixelDate = new Date(pixel.timestamp);
					const hour = pixelDate.getHours();
					const hourKey = `${hour}:00`;

					if (hourlyData[hourKey] !== undefined) {
					hourlyData[hourKey]++;
					}
				});

				// Convertir en format de timeline en ordre chronologique (des dernières 24h)
				// Les heures seront affichées de la plus ancienne à la plus récente
				const timelineEntries = [];
				for (let i = 23; i >= 0; i--) {
					const hourOffset = (currentHour - i + 24) % 24;
					const hourKey = `${hourOffset}:00`;
					timelineEntries.push({
					date: hourKey,
					count: hourlyData[hourKey]
					});
				}

				timelineData.push(...timelineEntries);
			} else if (timeRange === 'week') {
				const dailyData: Record<string, number> = {};

				// Créer des entrées pour chacun des 7 derniers jours
				for (let i = 0; i < 7; i++) {
				  const date = new Date(now);
				  date.setDate(now.getDate() - i); // Remonter de i jours

				  // Format pour le jour: "JJ/MM" (par exemple "30/03")
				  const dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
				  dailyData[dateKey] = 0;
				}

				// Compter les pixels par jour
				filteredPixels.forEach(pixel => {
				  const pixelDate = new Date(pixel.timestamp);
				  const dateKey = `${pixelDate.getDate()}/${pixelDate.getMonth() + 1}`;

				  if (dailyData[dateKey] !== undefined) {
					dailyData[dateKey]++;
				  }
				});

				// Convertir en format de timeline (en ordre chronologique)
				// Trier les clés pour avoir les jours dans l'ordre chronologique (du plus ancien au plus récent)
				Object.keys(dailyData).sort((a, b) => {
				  const [dayA, monthA] = a.split('/').map(Number);
				  const [dayB, monthB] = b.split('/').map(Number);

				  // Comparer d'abord par mois, puis par jour
				  if (monthA !== monthB) return monthA - monthB;
				  return dayA - dayB;
				}).forEach(dateKey => {
				  timelineData.push({
					date: dateKey,
					count: dailyData[dateKey]
				  });
				});
			} else if (timeRange === 'month') {
				const monthlyData: Record<string, number> = {};

				// Déterminer le premier jour de la période
				const firstDay = new Date(startDate);
				const currentDay = new Date(now); // Jour actuel

				// Créer une entrée pour chaque jour, y compris aujourd'hui
				for (let i = 0; i <= 30; i++) { // Notez le <= au lieu de
				const currentDate = new Date(firstDay);
				currentDate.setDate(firstDay.getDate() + i);

				// S'arrêter si on dépasse le jour actuel
				if (currentDate > currentDay) break;

				const dateKey = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
				monthlyData[dateKey] = 0;
				}

			// Compter les pixels par jour
			filteredPixels.forEach(pixel => {
				const pixelDate = new Date(pixel.timestamp);
				const dateKey = `${pixelDate.getDate()}/${pixelDate.getMonth() + 1}`;

				if (monthlyData[dateKey] !== undefined) {
				monthlyData[dateKey]++;
				}
			});

			// Convertir en format de timeline
			Object.keys(monthlyData).sort((a, b) => {
				const [dayA, monthA] = a.split('/').map(Number);
				const [dayB, monthB] = b.split('/').map(Number);
				if (monthA !== monthB) return monthA - monthB;
				return dayA - dayB;
			}).forEach(dateKey => {
				timelineData.push({
				date: dateKey,
				count: monthlyData[dateKey]
				});
			});
			} else {
			// Pour 'all', grouper par mois
			const allTimeData: Record<string, number> = {};
			const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

			// Trouver la date du premier pixel ou utiliser une date par défaut
			let earliestDate = now;
			if (pixelHistory.length > 0) {
				for (const pixel of pixelHistory) {
				const pixelDate = new Date(pixel.timestamp);
				if (pixelDate < earliestDate) {
					earliestDate = pixelDate;
				}
				}
			} else {
				earliestDate = new Date(now);
				earliestDate.setFullYear(now.getFullYear() - 1);
			}

			// Créer des entrées pour chaque mois sur un an maximum
			const startYear = earliestDate.getFullYear();
			const startMonth = earliestDate.getMonth();
			const endYear = now.getFullYear();
			const endMonth = now.getMonth();

			// Limiter à 12 mois maximum pour éviter trop de données
			let monthCounter = 0;
			const maxMonths = 12;

			for (let year = startYear; year <= endYear; year++) {
				const monthStart = (year === startYear) ? startMonth : 0;
				const monthEnd = (year === endYear) ? endMonth : 11;

				for (let month = monthStart; month <= monthEnd; month++) {
				if (monthCounter < maxMonths) {
					const dateKey = `${monthNames[month]} ${year}`;
					allTimeData[dateKey] = 0;
					monthCounter++;
				}
				}
			}

			// Compter les pixels par mois
			pixelHistory.forEach(pixel => {
				const pixelDate = new Date(pixel.timestamp);
				const dateKey = `${monthNames[pixelDate.getMonth()]} ${pixelDate.getFullYear()}`;

				if (allTimeData[dateKey] !== undefined) {
				allTimeData[dateKey]++;
				}
			});

			// Convertir en format de timeline (en triant chronologiquement)
			Object.keys(allTimeData).sort((a, b) => {
				const [monthA, yearA] = [monthNames.indexOf(a.split(' ')[0]), Number(a.split(' ')[1])];
				const [monthB, yearB] = [monthNames.indexOf(b.split(' ')[0]), Number(b.split(' ')[1])];
				if (yearA !== yearB) return yearA - yearB;
				return monthA - monthB;
			}).forEach(dateKey => {
				timelineData.push({
				date: dateKey,
				count: allTimeData[dateKey]
				});
			});
			}

			res.status(200).json({
			status: 'success',
			data: {
				totalPixels: filteredPixels.length,
				timelineData
			}
			});
		} catch (error: any) {
			console.error('Error in getUserContributionTimeline:', error);
			return next(new AppErrorClass('Erreur lors de la récupération des contributions', 500));
		}
		}
	);
}
