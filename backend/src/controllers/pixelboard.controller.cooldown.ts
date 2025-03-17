  /**
   * Vérifier le statut du cooldown pour un utilisateur
   */
  static checkCooldown = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppErrorClass('ID du PixelBoard requis', 400));
    }

    if (!req.user?.id) {
      return next(new AppErrorClass('Authentification requise', 401));
    }

    // Vérifier si le PixelBoard existe
    const pixelBoard = await PixelBoardModel.findById(id);
    if (!pixelBoard) {
      return next(new AppErrorClass('PixelBoard non trouvé', 404));
    }

    // Vérifier si l'utilisateur est premium
    const isPremium = req.user.role === 'premium' || req.user.role === 'admin';

    // Obtenir le statut du cooldown
    const canPlace = await PixelCooldownModel.canPlacePixel(
      req.user.id,
      id,
      pixelBoard.cooldown,
      isPremium
    );

    // Obtenir le temps restant (0 si l'utilisateur peut placer un pixel)
    const remainingSeconds = await PixelCooldownModel.getRemainingCooldown(
      req.user.id,
      id,
      pixelBoard.cooldown
    );

    res.status(200).json({
      status: 'success',
      data: {
        canPlace,
        remainingSeconds,
        isPremium
      }
    });
  });
