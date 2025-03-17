import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import PixelBoardDisplay from '@/components/pixel-board/PixelBoardDisplay';
import PixelBoardService from '@/services/pixelboard.service'; // Importation du service

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  // États pour les données
  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#000000'); // État pour stocker la couleur sélectionnée

  // État pour le succès du placement de pixel
  const [placementSuccess, setPlacementSuccess] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [placingPixel, setPlacingPixel] = useState<boolean>(false); // Nouvel état pour suivre le chargement du placement

  // Charger les détails du PixelBoard
  useEffect(() => {
    const loadBoard = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      const response = await ApiService.getPixelBoardById(id);

      if (response.error) {
        setError(response.error);
      } else {
        setBoard(response.data || null);
      }

      setLoading(false);
    };

    loadBoard();
  }, [id]);

  // Vérifier si un pixel peut être placé
  const canPlacePixel = (): boolean => {
    if (!board || !board.is_active) return false;
    if (!isAuthenticated) return false;
    if (cooldownEnd && new Date() < cooldownEnd) return false;
    if (placingPixel) return false; // Ne pas permettre le placement pendant le chargement
    return true;
  };

  // Fonction pour placer un pixel - MODIFIÉE POUR UTILISER L'API
  const handlePixelPlaced = async (x: number, y: number, color: string) => {
    if (!canPlacePixel() || !board || !id) return;

    setPlacementSuccess(null);
    setPlacementError(null);
    setPlacingPixel(true); // Début du chargement

    // Vérifier si on peut écraser le pixel existant
    const pixelKey = `${x},${y}`;
    if (board.grid[pixelKey] && !board.allow_overwrite) {
      setPlacementError('Ce pixel a déjà été placé et ne peut pas être écrasé.');
      setPlacingPixel(false);
      return;
    }

    try {
      // Appel à l'API pour sauvegarder le pixel
      const response = await PixelBoardService.placePixel(id, x, y, color);

      if (response.error) {
        setPlacementError(response.error || 'Erreur lors du placement du pixel.');
      } else {
        // Mise à jour locale après confirmation du serveur
        const newGrid = { ...board.grid };
        newGrid[pixelKey] = color;

        setBoard({
          ...board,
          grid: newGrid,
        });

        // Configurer le cooldown
        const cooldownTime = new Date();
        cooldownTime.setSeconds(cooldownTime.getSeconds() + board.cooldown);
        setCooldownEnd(cooldownTime);

        setPlacementSuccess(`Pixel placé avec succès en (${x}, ${y})`);
      }
    } catch (error) {
      console.error('Erreur lors du placement du pixel:', error);
      setPlacementError('Erreur lors du placement du pixel. Veuillez réessayer.');
    } finally {
      setPlacingPixel(false); // Fin du chargement

      // Réinitialiser les messages après 3 secondes
      setTimeout(() => {
        setPlacementSuccess(null);
        setPlacementError(null);
      }, 3000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement du PixelBoard..." />;
  }

  if (error) {
    return (
      <div className="pixel-board-detail-page">
        <ErrorMessage message={error} onRetry={() => navigate(0)} />
        <button
          onClick={() => navigate('/pixel-boards')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour aux PixelBoards
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="pixel-board-detail-page">
        <ErrorMessage message="PixelBoard non trouvé" />
        <button
          onClick={() => navigate('/pixel-boards')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour aux PixelBoards
        </button>
      </div>
    );
  }

  return (
    <div className="pixel-board-detail-page">
      {/* Afficher des alertes pour les erreurs ou succès */}
      {placementSuccess && <div className="success-message mb-4">{placementSuccess}</div>}
      {placementError && <div className="error-message mb-4">{placementError}</div>}
      {placingPixel && <div className="info-message mb-4">Placement du pixel en cours...</div>}

      {!isAuthenticated && board.is_active && (
        <div className="warning-message mb-4">
          Connectez-vous pour placer des pixels sur ce PixelBoard.
        </div>
      )}

      {cooldownEnd && new Date() < cooldownEnd && (
        <div className="info-message mb-4">
          Prochain placement de pixel disponible dans{' '}
          {Math.ceil((cooldownEnd.getTime() - new Date().getTime()) / 1000)} secondes.
        </div>
      )}

      <div className="board-interaction">
        <PixelBoardDisplay
          board={board}
          readOnly={!canPlacePixel()}
          onPixelPlaced={handlePixelPlaced}
          selectedColor={selectedColor}
          canEdit={board.is_active && isAuthenticated}
        />
      </div>
    </div>
  );
};

export default PixelBoardDetail;
