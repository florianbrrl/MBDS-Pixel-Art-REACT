import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import { StatsService } from '../services/stats.service';

export class StatsController {
  /**
   * Récupérer les statistiques globales de l'application
   */
  static getGlobalStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await StatsService.getGlobalStats();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les statistiques d'activité des utilisateurs
   */
  static getUserActivityStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await StatsService.getUserActivityStats();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les statistiques détaillées pour un PixelBoard spécifique
   */
  static getBoardStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!id) {
        return next(new AppErrorClass('ID du PixelBoard requis', 400));
      }

      const stats = await StatsService.getBoardStats(id);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les métriques d'engagement des utilisateurs
   */
  static getEngagementMetrics = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const metrics = await StatsService.getEngagementMetrics();

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    }
  );

  /**
   * Récupérer l'activité récente sous forme de timeline
   */
  static getRecentActivity = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const activity = await StatsService.getRecentActivity();

      res.status(200).json({
        status: 'success',
        data: activity,
      });
    }
  );

  /**
   * Récupérer les statistiques du SuperBoard
   */
  static getSuperBoardStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await StatsService.getSuperBoardStats();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les statistiques de placement de pixels (heatmap)
   */
  static getPixelPlacementStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await StatsService.getPixelPlacementStats();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les données de heatmap pour un tableau spécifique
   */
  static getBoardHeatmap = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { timeFrame } = req.query;

      if (!id) {
        return next(new AppErrorClass('ID du PixelBoard requis', 400));
      }

      const validTimeFrames = ['24h', '7d', '30d', 'all'];
      const selectedTimeFrame = validTimeFrames.includes(timeFrame as string)
        ? (timeFrame as string)
        : 'all';

      const heatmap = await StatsService.getBoardHeatmap(id, selectedTimeFrame);

      res.status(200).json({
        status: 'success',
        data: {
          boardId: id,
          timeFrame: selectedTimeFrame,
          heatmap,
        },
      });
    }
  );

  /**
   * Récupérer les statistiques de contribution d'un utilisateur
   */
  static getUserContributionStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Si l'utilisateur demande ses propres statistiques
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppErrorClass('Authentification requise', 401));
      }

      const stats = await StatsService.getUserContributionStats(userId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );

  /**
   * Récupérer les statistiques de contribution d'un utilisateur sur un tableau spécifique
   */
  static getUserBoardContributionStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppErrorClass('Authentification requise', 401));
      }

      if (!id) {
        return next(new AppErrorClass('ID du PixelBoard requis', 400));
      }

      const stats = await StatsService.getUserBoardContributionStats(userId, id);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    }
  );
}