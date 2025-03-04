import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard, PixelHistory } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // États pour les données
  const [board, setBoard] = useState<PixelBoard | null>(null);
  const [history, setHistory] = useState<PixelHistory[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#FF0000');
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);

  // États pour la position du pixel sélectionné
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

  // Charger l'historique des pixels
  useEffect(() => {
    const loadHistory = async () => {
      if (!id) return;

      setHistoryLoading(true);
      setHistoryError(null);

      const response = await ApiService.getPixelHistory(id);

      if (response.error) {
        setHistoryError(response.error);
      } else {
        setHistory(response.data || []);
      }

      setHistoryLoading(false);
    };

    loadHistory();
  }, [id]);

  // Fonction pour calculer le temps de cooldown restant
  const getRemainingCooldown = (): string => {
    if (!cooldownEnd) return '';

    const now = new Date();
    const diff = cooldownEnd.getTime() - now.getTime();

    if (diff <= 0) return '';

    const seconds = Math.ceil(diff / 1000);
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  };

  // Fonction pour calculer le temps restant avant la fermeture
  const getTimeRemaining = (): string => {
    if (!board) return '';

    const end = new Date(board.end_time).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance < 0) return 'Terminé';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} restante${minutes > 1 ? 's' : ''}`;
    }
  };

  // Fonction pour vérifier si un pixel peut être placé
  const canPlacePixel = (): boolean => {
    if (!board || !board.is_active) return false;
    if (!isAuthenticated) return false;
    if (cooldownEnd && new Date() < cooldownEnd) return false;
    return true;
  };

  // Fonction pour placer un pixel
  const handlePlacePixel = async (x: number, y: number) => {
    if (!canPlacePixel() || !board || !id) return;

    setPlacementSuccess(null);
    setPlacementError(null);

    // Simuler le placement d'un pixel (dans une vraie implémentation, ce serait un appel API)
    try {
      // Mettre à jour localement
      const newGrid = { ...board.grid };
      newGrid[`${x},${y}`] = selectedColor;

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

  // Gérer le clic sur la grille
  const handleGridClick = (x: number, y: number) => {
    if (!canPlacePixel()) return;

    if (selectedPosition && selectedPosition.x === x && selectedPosition.y === y) {
      // Si on clique sur la position déjà sélectionnée, placer le pixel
      handlePlacePixel(x, y);
      setSelectedPosition(null);
    } else {
      // Sinon, sélectionner la position
      setSelectedPosition({ x, y });
    }
  };

  // Calculer la taille des pixels en fonction de la taille de l'écran et du PixelBoard
  const calculatePixelSize = (): number => {
    if (!board) return 10;

    const minSize = 4; // Taille minimale des pixels
    const maxSize = 20; // Taille maximale des pixels
    const maxBoardSize = 500; // Taille maximale du tableau sur l'écran

    const maxDimension = Math.max(board.width, board.height);
    const pixelSize = Math.min(maxSize, Math.max(minSize, Math.floor(maxBoardSize / maxDimension)));

    return pixelSize;
  };

  // Gérer la sélection d'une couleur
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  if (loading) {
    return (
      <div className="pixel-board-detail-page flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner message="Chargement du PixelBoard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pixel-board-detail-page">
        <ErrorMessage
          message={error}
          onRetry={() => navigate(0)} // Recharger la page
        />
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

  const pixelSize = calculatePixelSize();

  return (
    <div className="pixel-board-detail-page">
      <h1 className="text-3xl font-bold mb-4">{board.title}</h1>

      <div className="board-meta mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="mb-2">
            <span className="font-semibold">Dimensions:</span> {board.width}x{board.height}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Délai entre placements:</span> {board.cooldown} secondes
          </div>
          <div>
            <span className="font-semibold">Écrasement autorisé:</span>{' '}
            {board.allow_overwrite ? 'Oui' : 'Non'}
          </div>
        </div>
        <div className="stat-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="mb-2">
            <span className="font-semibold">Statut:</span>{' '}
            <span
              className={`inline-block px-2 py-1 text-sm rounded ${
                board.is_active
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              {board.is_active ? 'Actif' : 'Terminé'}
            </span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">
              {board.is_active ? 'Temps restant:' : 'Terminé le:'}
            </span>{' '}
            {board.is_active ? getTimeRemaining() : new Date(board.end_time).toLocaleDateString()}
          </div>
          {cooldownEnd && new Date() < cooldownEnd && (
            <div className="text-yellow-600 dark:text-yellow-400">
              Prochain placement disponible dans: {getRemainingCooldown()}
            </div>
          )}
        </div>
      </div>

      {placementSuccess && (
        <div className="mb-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          {placementSuccess}
        </div>
      )}

      {placementError && (
        <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          {placementError}
        </div>
      )}

      {!isAuthenticated && board.is_active && (
        <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
          Connectez-vous pour placer des pixels sur ce PixelBoard.
        </div>
      )}

      <div className="board-interaction flex flex-col md:flex-row gap-6">
        <div className="pixel-grid-container">
          <div
            className="pixel-grid mb-4"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${board.width}, ${pixelSize}px)`,
              gridTemplateRows: `repeat(${board.height}, ${pixelSize}px)`,
              gap: '1px',
              backgroundColor: 'var(--grid-lines)',
              border: '1px solid var(--grid-lines)',
              width: `${board.width * pixelSize + board.width - 1}px`,
              height: `${board.height * pixelSize + board.height - 1}px`,
            }}
          >
            {Array.from({ length: board.height }).map((_, y) =>
              Array.from({ length: board.width }).map((_, x) => {
                const key = `${x},${y}`;
                const color = board.grid[key] || 'var(--grid-bg)';
                const isSelected =
                  selectedPosition && selectedPosition.x === x && selectedPosition.y === y;

                return (
                  <div
                    key={key}
                    style={{
                      backgroundColor: color,
                      width: `${pixelSize}px`,
                      height: `${pixelSize}px`,
                      border: isSelected ? '2px solid white' : 'none',
                      boxSizing: 'border-box',
                      cursor: canPlacePixel() ? 'pointer' : 'default',
                    }}
                    onClick={() => handleGridClick(x, y)}
                    title={`(${x}, ${y})`}
                  />
                );
              }),
            )}
          </div>

          <div className="zoom-controls flex justify-center gap-2 mb-4">
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              onClick={() => {
                /* Zoom functionality would go here */
              }}
              disabled
            >
              Zoom -
            </button>
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              onClick={() => {
                /* Zoom functionality would go here */
              }}
              disabled
            >
              Zoom +
            </button>
          </div>
        </div>

        <div className="board-controls flex-1">
          {board.is_active && (
            <div className="color-palette mb-6">
              <h3 className="text-lg font-semibold mb-2">Palette de Couleurs</h3>
              <div className="colors-grid grid grid-cols-4 gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    style={{
                      backgroundColor: color,
                      width: '40px',
                      height: '40px',
                      border:
                        color === selectedColor
                          ? '3px solid white'
                          : '1px solid var(--border-color)',
                      borderRadius: '4px',
                    }}
                    onClick={() => handleColorSelect(color)}
                    disabled={!canPlacePixel()}
                    aria-label={`Sélectionner la couleur ${color}`}
                  />
                ))}
              </div>

              <div className="selected-color-display mt-4 flex items-center">
                <span className="mr-2">Couleur sélectionnée:</span>
                <div
                  style={{
                    backgroundColor: selectedColor,
                    width: '24px',
                    height: '24px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                  }}
                />
                <span className="ml-2">{selectedColor}</span>
              </div>

              {selectedPosition && (
                <div className="selected-position mt-4">
                  <p>
                    Position sélectionnée: ({selectedPosition.x}, {selectedPosition.y})
                  </p>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handlePlacePixel(selectedPosition.x, selectedPosition.y)}
                    disabled={!canPlacePixel()}
                  >
                    Placer le pixel
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="board-history">
            <h3 className="text-lg font-semibold mb-2">Historique Récent</h3>

            {historyLoading ? (
              <LoadingSpinner size="small" message="Chargement de l'historique..." />
            ) : historyError ? (
              <ErrorMessage message={historyError} />
            ) : history.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Aucun historique disponible.</p>
            ) : (
              <div className="history-list overflow-y-auto max-h-64 bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                {history.slice(0, 10).map((entry, index) => (
                  <div
                    key={index}
                    className="history-item mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <div
                        style={{
                          backgroundColor: entry.color,
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          marginRight: '8px',
                        }}
                      />
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">Position:</span> ({entry.x}, {entry.y})
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelBoardDetail;
