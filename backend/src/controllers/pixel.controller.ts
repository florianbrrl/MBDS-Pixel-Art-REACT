import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../middleware/errorHandler.middleware';
import { PixelService, IPlacePixelData } from '../services/pixel.service';

export class PixelController {
  /**
   * Placer un pixel sur un tableau
   */
  static placePixel = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { boardId } = req.params;
      const { x, y, color } = req.body;

      // Valider l'entrée de base
      if (!boardId || x === undefined || y === undefined || !color) {
        return res.status(400).json({
          status: 'error',
          message: 'Paramètres manquants: boardId, x, y, et color sont requis',
        });
      }

      // Créer les données du pixel
      const pixelData: IPlacePixelData = {
        boardId,
        x: parseInt(x, 10),
        y: parseInt(y, 10),
        color,
        userId: req.user?.id, // Optionnel: utilisateur authentifié
      };

      // Placer le pixel (avec transaction)
      const result = await PixelService.placePixel(pixelData);

      // Répondre avec succès
      res.status(201).json({
        status: 'success',
        data: result,
      });
    }
  );

  /**
   * Obtenir l'état actuel d'un pixel
   */
  static getPixelState = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { boardId, x, y } = req.params;

      // Obtenir l'état du pixel
      const pixelState = await PixelService.getPixelState(
        boardId,
        parseInt(x, 10),
        parseInt(y, 10)
      );

      // Répondre avec l'état du pixel
      res.status(200).json({
        status: 'success',
        data: pixelState,
      });
    }
  );

  /**
   * Obtenir l'historique d'un pixel
   */
  static getPixelHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const { boardId, x, y } = req.params;

      // Obtenir l'historique du pixel
      const pixelHistory = await PixelService.getPixelHistory(
        boardId,
        parseInt(x, 10),
        parseInt(y, 10)
      );

      // Répondre avec l'historique du pixel
      res.status(200).json({
        status: 'success',
        data: pixelHistory,
      });
    }
  );
}