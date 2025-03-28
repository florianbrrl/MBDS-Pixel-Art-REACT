import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCooldown } from '@/hooks/useCooldown';
import CooldownIndicator from '@/components/pixel-board/CooldownIndicator';
import ApiService from '@/services/api.service';
import PixelBoardService from '@/services/pixelboard.service';
import WebSocketService from '@/services/websocket.service';
import { PixelBoard, PixelUpdateData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PixelBoardDisplay from '@/components/pixel-board/PixelBoardDisplay';

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // États pour les données du board
  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour le succès du placement de pixel
  const [placementSuccess, setPlacementSuccess] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [placingPixel, setPlacingPixel] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');

  // Utiliser notre hook de cooldown
  const {
    status: cooldownStatus,
    refresh: refreshCooldown
  } = useCooldown(id);

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

  // useEffect pour la connexion WebSocket
  useEffect(() => {
    if (!id) return;

    // Connecter au WebSocket et rejoindre le canal du board
    WebSocketService.connect();
    WebSocketService.joinBoard(id);

    // S'abonner aux mises à jour de pixels
    const handlePixelUpdate = (data: PixelUpdateData) => {
      // Vérifier que les données concernent bien ce tableau
      if (data.pixelboard_id === id) {
        console.log('Received pixel update:', data);

        // Mettre à jour l'état du board avec le nouveau pixel
        setBoard(prevBoard => {
          if (!prevBoard) return prevBoard;

          const newGrid = { ...prevBoard.grid };
          const pixelKey = `${data.x},${data.y}`;
          newGrid[pixelKey] = data.color;

          return { ...prevBoard, grid: newGrid };
        });
      }
    };

    WebSocketService.onPixelUpdate(handlePixelUpdate);

    // Nettoyage à la démonture du composant
    return () => {
      WebSocketService.offPixelUpdate(handlePixelUpdate);
      WebSocketService.disconnect();
    };
  }, [id]);

  // Vérifier si un pixel peut être placé
  const canPlacePixel = (): boolean => {
    if (!board || !board.is_active) return false;
    if (!isAuthenticated) return false;

    // Utiliser l'état du cooldown
    return cooldownStatus.canPlace || cooldownStatus.isPremium;
  };

  // Fonction pour placer un pixel
  const handlePixelPlaced = async (x: number, y: number, color: string) => {
    if (!canPlacePixel() || !board || !id) return;

    setPlacementSuccess(null);
    setPlacementError(null);
    setPlacingPixel(true);

    try {
      // Vérifier si on peut écraser le pixel existant
      const pixelKey = `${x},${y}`;
      if (board.grid[pixelKey] && !board.allow_overwrite) {
        setPlacementError('Ce pixel a déjà été placé et ne peut pas être écrasé.');
        setPlacingPixel(false);
        return;
      }

      // Appel à l'API pour sauvegarder le pixel
      const response = await PixelBoardService.placePixel(id, x, y, color);

      if (response.error) {
        setPlacementError(response.error || 'Erreur lors du placement du pixel.');
      } else {
        // Mise à jour locale immédiate, sans attendre la mise à jour WebSocket
        const newGrid = { ...board.grid };
        newGrid[pixelKey] = color;

        setBoard({
          ...board,
          grid: newGrid,
        });

        setPlacementSuccess(`Pixel placé avec succès en (${x}, ${y})`);

        // Rafraîchir le statut du cooldown
        refreshCooldown();
      }
    } catch (error) {
      console.error('Erreur lors du placement du pixel:', error);
      setPlacementError('Erreur lors du placement du pixel. Veuillez réessayer.');
    } finally {
      setPlacingPixel(false);

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

      {/* Intégrer l'indicateur de cooldown ici */}
      {isAuthenticated && board.is_active && (
        <CooldownIndicator
          remainingSeconds={cooldownStatus.remainingSeconds}
          isPremium={cooldownStatus.isPremium}
          canPlace={cooldownStatus.canPlace}
          totalCooldown={board.cooldown}
        />
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
