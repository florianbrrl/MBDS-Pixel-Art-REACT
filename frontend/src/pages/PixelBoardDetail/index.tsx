import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCooldown } from '@/hooks/useCooldown';
import CooldownIndicator from '@/components/pixel-board/CooldownIndicator';
import ApiService from '@/services/api.service';
import { WebSocketService } from '@/services/websocket.service';
import { PixelBoard, PixelUpdateData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PixelBoardDisplay from '@/components/pixel-board/PixelBoardDisplay';
import ExportModal from '@/components/export/ExportModal';
import BoardConnectionCounter from '@/components/common/BoardConnectionCounter';
import '@/styles/connection-counter.css';
import '@/styles/websocket-status.css';
import '../../styles/PixelBoardDetail.css';

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // États pour les données du board
  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  // État pour le succès du placement de pixel
  const [placementSuccess, setPlacementSuccess] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [placingPixel, setPlacingPixel] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');

  // État pour l'exportation
  const [showExportModal, setShowExportModal] = useState(false);

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

      try {
        const response = await ApiService.getPixelBoardById(id);

        if (response.error) {
          setError(response.error);
        } else {
          setBoard(response.data || null);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du board:", err);
        setError("Une erreur est survenue lors du chargement du tableau");
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [id]);

  // Gestionnaire de mise à jour de pixel via WebSocket
  const handlePixelUpdate = useCallback((data: PixelUpdateData) => {
    // Vérifier que les données concernent bien ce tableau
    if (data.pixelboard_id === id) {
      console.log('Processing pixel update:', data);

      // Mettre à jour l'état du board avec le nouveau pixel
      setBoard(prevBoard => {
        if (!prevBoard) return prevBoard;

        const newGrid = { ...prevBoard.grid };
        const pixelKey = `${data.x},${data.y}`;
        newGrid[pixelKey] = data.color;

        return { ...prevBoard, grid: newGrid };
      });
    }
  }, [id]);

  // useEffect pour la connexion WebSocket
  useEffect(() => {
    if (!id) return;

    setWsStatus('connecting');

    // Initialiser la connexion WebSocket
    try {
      WebSocketService.connect(id);
    } catch (err) {
      console.error("Erreur lors de l'initialisation WebSocket:", err);
      setWsStatus('disconnected');
    }

    // S'abonner aux mises à jour de pixels
    const unsubscribe = WebSocketService.onPixelUpdate(handlePixelUpdate);

    // Mettre à jour le statut initial
    setWsStatus(WebSocketService.getConnectionStatus ?
      WebSocketService.getConnectionStatus() === 'connected' ? 'connected' : 'connecting' :
      WebSocketService.isConnected() ? 'connected' : 'connecting');

    // Timer pour vérifier périodiquement l'état de la connexion
    const wsCheckInterval = setInterval(() => {
      const status = WebSocketService.getConnectionStatus ?
        WebSocketService.getConnectionStatus() :
        WebSocketService.isConnected() ? 'connected' : 'disconnected';

      if (status === 'connected') {
        setWsStatus('connected');
      } else if (status === 'connecting') {
        setWsStatus('connecting');
      } else {
        setWsStatus('disconnected');

        // Tentative de reconnexion si déconnecté
        if (status === 'disconnected' || status === 'error') {
          console.log('Tentative de reconnexion WebSocket...');
          try {
            WebSocketService.connect(id);
          } catch (err) {
            console.error('Échec de la tentative de reconnexion:', err);
          }
        }
      }
    }, 3000);

    // Nettoyage à la démonture du composant
    return () => {
      unsubscribe();
      clearInterval(wsCheckInterval);
    };
  }, [id, handlePixelUpdate]);

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
      const response = await ApiService.placePixel(id, x, y, color);

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
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
      <div className="pixel-board-header">
        <div className="header-content">
          <h1>{board.title}</h1>

          {/* Ajout du compteur de connexions */}
          {id && <BoardConnectionCounter boardId={id} className="board-connections" />}
        </div>
      </div>

      {/* Indicateur WebSocket */}
      {wsStatus !== 'connected' && (
        <div className={`websocket-status ${wsStatus}`}>
          {wsStatus === 'connecting' ? 'Connexion en cours...' : 'Déconnecté. Les mises à jour en temps réel sont indisponibles.'}
        </div>
      )}

      {/* Afficher des alertes pour les erreurs ou succès */}
      <div className="notifications-container">
        {placementSuccess && <div className="notification success-message">{placementSuccess}</div>}
        {placementError && <div className="notification error-message">{placementError}</div>}
        {placingPixel && <div className="notification info-message">{placingPixel ? 'Placement du pixel en cours...' : ''}</div>}
      </div>

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

      {board && (
        <div className="board-actions">
          <Link
            to={`/pixel-boards/${board.id}/heatmap`}
            className="heatmap-button"
          >
            Voir la Heatmap d'activité
          </Link>
        </div>
      )}

      <div className="board-interaction">
        <PixelBoardDisplay
          board={board}
          readOnly={!canPlacePixel()}
          onPixelPlaced={handlePixelPlaced}
          selectedColor={selectedColor}
          canEdit={board.is_active && isAuthenticated}
          onColorSelect={handleColorSelect}
        />
      </div>

      {/* Modal d'exportation */}
      {showExportModal && board && (
        <ExportModal
          board={board}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Bouton flottant d'exportation */}
      <div className="floating-export-button" onClick={() => setShowExportModal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Exporter</span>
      </div>
    </div>
  );
};

export default PixelBoardDetail;
