import { Request, Response, NextFunction } from 'express';
import { catchAsync, AppErrorClass } from '../middleware/errorHandler.middleware';
import { PixelBoardModel, IPixelBoardCreate } from '../models/pixelboard.model';
import { randomUUID } from 'crypto';

/**
 * Fonction de validation pour les données PixelBoard
 */
const validatePixelBoardData = (data: any) => {
  // Vérifier les limites de taille
  if (data.width && (data.width < 10 || data.width > 1000)) {
    throw new AppErrorClass('La largeur doit être entre 10 et 1000', 400);
  }

  if (data.height && (data.height < 10 || data.height > 1000)) {
    throw new AppErrorClass('La hauteur doit être entre 10 et 1000', 400);
  }

  // Vérifier les dates
  if (data.start_time && data.end_time) {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (start >= end) {
      throw new AppErrorClass('La date de fin doit être postérieure à la date de début', 400);
    }
  }

  return true;
};

export class PixelBoardController {
  /**
   * Récupérer tous les PixelBoards
   */
  static getAllPixelBoards = catchAsync(async (req: Request, res: Response) => {
    const pixelBoards = await PixelBoardModel.findAll();

    res.status(200).json({
      status: 'success',
      data: pixelBoards,
    });
  });

  /**
   * Récupérer les PixelBoards actifs uniquement
   */
  static getActivePixelBoards = catchAsync(async (req: Request, res: Response) => {
    const activePixelBoards = await PixelBoardModel.findActive();

    res.status(200).json({
      status: 'success',
      data: activePixelBoards,
    });
  });

  /**
   * Récupérer les PixelBoards terminés (non actifs)
   */
  static getCompletedPixelBoards = catchAsync(async (req: Request, res: Response) => {
    // Récupérer tous les PixelBoards
    const allPixelBoards = await PixelBoardModel.findAll();

    // Filtrer pour ne garder que les terminés
    const completedPixelBoards = allPixelBoards.filter(board => !board.is_active);

    res.status(200).json({
      status: 'success',
      data: completedPixelBoards,
    });
  });

  /**
   * Récupérer un PixelBoard par son ID
   */
  static getPixelBoardById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppErrorClass('ID du PixelBoard requis', 400));
    }

    const pixelBoard = await PixelBoardModel.findById(id);

    if (!pixelBoard) {
      return next(new AppErrorClass('PixelBoard non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: pixelBoard,
    });
  });

  /**
   * Créer un nouveau PixelBoard
   */
  static createPixelBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { title, width, height, cooldown, allow_overwrite, start_time, end_time } = req.body;

    // Validation de base
    if (!title || !width || !height || !start_time || !end_time) {
      return next(new AppErrorClass('Champs obligatoires manquants', 400));
    }

    // Validation approfondie
    validatePixelBoardData(req.body);

    // Création des données pour le PixelBoard
    const pixelBoardData: IPixelBoardCreate = {
      title,
      width: Number(width),
      height: Number(height),
      grid: {}, // Grille vide initialement
      cooldown: cooldown ? Number(cooldown) : 60, // Valeur par défaut: 60 secondes
      allow_overwrite: allow_overwrite || false, // Valeur par défaut: false
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      admin_id: req.user?.id, // ID de l'administrateur qui crée le PixelBoard
    };

    // Création du PixelBoard
    const pixelBoard = await PixelBoardModel.create(pixelBoardData);

    res.status(201).json({
      status: 'success',
      data: pixelBoard,
    });
  });

  /**
   * Mettre à jour un PixelBoard
   */
  static updatePixelBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, width, height, cooldown, allow_overwrite, start_time, end_time } = req.body;

    if (!id) {
      return next(new AppErrorClass('ID du PixelBoard requis', 400));
    }

    // Vérifier si le PixelBoard existe
    const existingPixelBoard = await PixelBoardModel.findById(id);

    if (!existingPixelBoard) {
      return next(new AppErrorClass('PixelBoard non trouvé', 404));
    }

    // Vérifier que l'utilisateur est l'administrateur du PixelBoard
    if (existingPixelBoard.admin_id && existingPixelBoard.admin_id !== req.user?.id) {
      return next(new AppErrorClass('Vous n\'êtes pas autorisé à modifier ce PixelBoard', 403));
    }

    // Validation des données
    if (width || height || start_time || end_time) {
      validatePixelBoardData({
        width: width || existingPixelBoard.width,
        height: height || existingPixelBoard.height,
        start_time: start_time || existingPixelBoard.start_time,
        end_time: end_time || existingPixelBoard.end_time,
      });
    }

    // Mettre à jour les champs
    const updatedPixelBoard = await PixelBoardModel.update(id, {
      ...(title && { title }),
      ...(width && { width: Number(width) }),
      ...(height && { height: Number(height) }),
      ...(cooldown !== undefined && { cooldown: Number(cooldown) }),
      ...(allow_overwrite !== undefined && { allow_overwrite }),
      ...(start_time && { start_time: new Date(start_time) }),
      ...(end_time && { end_time: new Date(end_time) }),
    });

    res.status(200).json({
      status: 'success',
      data: updatedPixelBoard,
    });
  });

  /**
   * Supprimer un PixelBoard
   */
  static deletePixelBoard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppErrorClass('ID du PixelBoard requis', 400));
    }

    // Vérifier si le PixelBoard existe
    const existingPixelBoard = await PixelBoardModel.findById(id);

    if (!existingPixelBoard) {
      return next(new AppErrorClass('PixelBoard non trouvé', 404));
    }

    // Vérifier que l'utilisateur est l'administrateur du PixelBoard
    if (existingPixelBoard.admin_id && existingPixelBoard.admin_id !== req.user?.id) {
      return next(new AppErrorClass('Vous n\'êtes pas autorisé à supprimer ce PixelBoard', 403));
    }

    // Supprimer le PixelBoard
    await PixelBoardModel.delete(id);

    res.status(204).send();
  });
}
