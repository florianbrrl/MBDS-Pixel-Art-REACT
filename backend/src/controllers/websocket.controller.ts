import { Request, Response, NextFunction } from 'express';
import { SimpleWSService } from '../services/simple-ws.service';

export class WebSocketController {
  /**
   * Récupérer les statistiques de connexion pour tous les tableaux
   */
  static getAllConnectionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = SimpleWSService.getAllConnectionStats();
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les statistiques de connexion pour un tableau spécifique
   */
  static getBoardConnectionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const stats = SimpleWSService.getBoardConnectionStats(id);
      
      return res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}