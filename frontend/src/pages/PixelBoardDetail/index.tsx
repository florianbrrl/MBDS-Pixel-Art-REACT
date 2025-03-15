import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import PixelBoardDisplay from '@/components/pixel-board/PixelBoardDisplay';

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  // États pour les données
  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);

  // État pour le succès du placement de pixel
  const [placementSuccess, setPlacementSuccess] = useState<string | null>(null);
  const [placementError, setPlacementError] = useState<string | null>(null);

  // Palette de couleurs disponibles
  const colorPalette = [
    '#FF0000',
    '#FF8000',
    '#FFFF00',
    '#80FF00',
    '#00FF00',
    '#00FF80',
    '#00FFFF',
    '#0080FF',
    '#0000FF',
    '#8000FF',
    '#FF00FF',
    '#FF0080',
    '#FFFFFF',
    '#C0C0C0',
    '#808080',
    '#000000',
  ];

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
    return true;
  };

  // Fonction pour placer un pixel
  const handlePixelPlaced = async (x: number, y: number, color: string) => {
    if (!canPlacePixel() || !board || !id) return;

    setPlacementSuccess(null);
    setPlacementError(null);

    // Vérifier si on peut écraser le pixel existant
    const pixelKey = `${x},${y}`;
    if (board.grid[pixelKey] && !board.allow_overwrite) {
      setPlacementError('Ce pixel a déjà été placé et ne peut pas être écrasé.');
      return;
    }

    try {
      // Dans une implémentation réelle, nous ferions un appel API ici
      // Pour l'instant, mettons à jour localement
      const newGrid = { ...board.grid };
      newGrid[pixelKey] = color;

      setBoard({
        ...board,
        grid: newGrid,
      });

      // Simuler le cooldown
      const cooldownTime = new Date();
      cooldownTime.setSeconds(cooldownTime.getSeconds() + board.cooldown);
      setCooldownEnd(cooldownTime);

      setPlacementSuccess(`Pixel placé avec succès en (${x}, ${y})`);

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setPlacementSuccess(null);
      }, 3000);
    } catch (error) {
      setPlacementError('Erreur lors du placement du pixel. Veuillez réessayer.');
    }
  };

  // Gérer la sélection d'une couleur
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
      {/* Afficher des alertes pour les erreurs ou succès */}
      {placementSuccess && <div className="success-message mb-4">{placementSuccess}</div>}

      {placementError && <div className="error-message mb-4">{placementError}</div>}

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

        {board.is_active && isAuthenticated && (
          <div className="color-palette mt-4">
            <h3 className="text-lg font-semibold mb-2">Palette de Couleurs</h3>
            <div className="colors-grid grid grid-cols-8 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  style={{
                    backgroundColor: color,
                    width: '40px',
                    height: '40px',
                    border:
                      color === selectedColor ? '3px solid white' : '1px solid var(--border-color)',
                    borderRadius: '4px',
                  }}
                  onClick={() => handleColorSelect(color)}
                  disabled={!canPlacePixel()}
                  aria-label={`Sélectionner la couleur ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixelBoardDetail;
