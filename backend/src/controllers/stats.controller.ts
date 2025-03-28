import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

export class StatsController {
  /**
   * Provides overall application statistics
   */
  static async getGlobalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getGlobalStats();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tracks user engagement and activity trends
   */
  static async getUserActivityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getUserActivityStats();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detailed statistics for a specific PixelBoard
   */
  static async getPixelBoardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await StatsService.getPixelBoardStats(id);
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * For Admin dashboard trends analysis
   */
  static async getEngagementMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getEngagementMetrics();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * For displaying recent activity on the Admin dashboard
   */
  static async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getRecentActivity();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Statistics specific to the SuperPixelBoard feature
   */
  static async getSuperBoardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getSuperBoardStats();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Statistics on pixel placement across boards (heat map)
   */
  static async getPlacementStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatsService.getPlacementStats();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Provides heatmap data for pixel placements on a specific board
   */
  static async getPixelBoardHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const timeFrame = req.query.timeFrame as string || 'all';
      const stats = await StatsService.getPixelBoardHeatmap(id, timeFrame);
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Provides statistics about the current user's contributions
   */
  static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - user is attached in middleware
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }
      
      const stats = await StatsService.getUserStats(userId);
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Details of user's contributions to a specific board
   */
  static async getUserBoardContributions(req: Request, res: Response, next: NextFunction) {
    try {
      // @ts-ignore - user is attached in middleware
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }
      
      const { id } = req.params;
      const stats = await StatsService.getUserBoardContributions(userId, id);
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
