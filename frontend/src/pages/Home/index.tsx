import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

// Composant de prévisualisation pour un PixelBoard
const PixelBoardPreview: React.FC<{ board: PixelBoard }> = ({ board }) => {
  const previewSize = 120; // Taille fixe pour la prévisualisation
  const pixelSize = Math.min(previewSize / board.width, previewSize / board.height);

  return (
    <div className="board-preview">
      <h3 className="text-lg font-semibold mb-2">{board.title}</h3>
      <div
        className="board-preview-grid mb-2"
        style={{
          width: `${board.width * pixelSize}px`,
          height: `${board.height * pixelSize}px`,
          display: 'grid',
          gridTemplateColumns: `repeat(${board.width}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${board.height}, ${pixelSize}px)`,
          backgroundColor: 'var(--grid-bg)',
          border: '1px solid var(--grid-lines)',
        }}
      >
        {Object.entries(board.grid).map(([coord, color]) => {
          const [x, y] = coord.split(',').map(Number);
          return (
            <div
              key={coord}
              style={{
                gridColumn: x + 1,
                gridRow: y + 1,
                backgroundColor: color,
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
              }}
            />
          );
        })}
      </div>
      <div className="text-sm">
        <span className="inline-block px-2 py-1 mr-2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {board.width}x{board.height}
        </span>
        <span
          className={`inline-block px-2 py-1 rounded ${
            board.is_active
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
          }`}
        >
          {board.is_active ? 'Actif' : 'Terminé'}
        </span>
      </div>
      <Link
        to={`/pixel-boards/${board.id}`}
        className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline"
      >
        Voir détails
      </Link>
    </div>
  );
};

const Home: React.FC = () => {
  // États pour les données
  const [stats, setStats] = useState<any | null>(null);
  const [activeBoards, setActiveBoards] = useState<PixelBoard[]>([]);
  const [completedBoards, setCompletedBoards] = useState<PixelBoard[]>([]);

  // États pour le chargement
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeBoardsLoading, setActiveBoardsLoading] = useState(true);
  const [completedBoardsLoading, setCompletedBoardsLoading] = useState(true);

  // États pour les erreurs
  const [statsError, setStatsError] = useState<string | null>(null);
  const [activeBoardsError, setActiveBoardsError] = useState<string | null>(null);
  const [completedBoardsError, setCompletedBoardsError] = useState<string | null>(null);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError(null);

    const response = await ApiService.getGlobalStats();

    if (response.error) {
      setStatsError(response.error);
    } else {
      setStats(response.data);
    }

    setStatsLoading(false);
  };

  // Fonction pour charger les PixelBoards actifs
  const loadActiveBoards = async () => {
    setActiveBoardsLoading(true);
    setActiveBoardsError(null);

    const response = await ApiService.getActivePixelBoards();

    if (response.error) {
      setActiveBoardsError(response.error);
    } else {
      setActiveBoards(response.data || []);
    }

    setActiveBoardsLoading(false);
  };

  // Fonction pour charger les PixelBoards terminés
  const loadCompletedBoards = async () => {
    setCompletedBoardsLoading(true);
    setCompletedBoardsError(null);

    const response = await ApiService.getCompletedPixelBoards();

    if (response.error) {
      setCompletedBoardsError(response.error);
    } else {
      setCompletedBoards(response.data || []);
    }

    setCompletedBoardsLoading(false);
  };

  // Charger toutes les données au montage du composant
  useEffect(() => {
    loadStats();
    loadActiveBoards();
    loadCompletedBoards();
  }, []);

  return (
    <div className="home-page">
      <h1 className="text-3xl font-bold mb-6">Bienvenue sur PixelArt App</h1>
      <p className="text-lg mb-8">Créez et partagez des pixel arts avec la communauté !</p>

      <section className="home-stats mb-12">
        <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>

        {statsLoading ? (
          <LoadingSpinner size="small" message="Chargement des statistiques..." />
        ) : statsError ? (
          <ErrorMessage message={statsError} onRetry={loadStats} />
        ) : (
          <div className="stats-container grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stat-item bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl mb-2">Utilisateurs</h3>
              <p className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="stat-item bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl mb-2">PixelBoards</h3>
              <p className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalBoards || 0}
              </p>
              <p className="text-sm mt-2">
                <span className="text-green-600 dark:text-green-400">
                  {stats?.activeBoards || 0} actifs
                </span>
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="featured-boards mb-12">
        <h2 className="text-2xl font-semibold mb-4">PixelBoards en cours</h2>

        {activeBoardsLoading ? (
          <LoadingSpinner message="Chargement des PixelBoards actifs..." />
        ) : activeBoardsError ? (
          <ErrorMessage message={activeBoardsError} onRetry={loadActiveBoards} />
        ) : activeBoards.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Aucun PixelBoard actif pour le moment.</p>
        ) : (
          <div className="boards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {activeBoards.map((board) => (
              <div
                key={board.id}
                className="board-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-transform hover:scale-105"
              >
                <PixelBoardPreview board={board} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="completed-boards">
        <h2 className="text-2xl font-semibold mb-4">PixelBoards terminés</h2>

        {completedBoardsLoading ? (
          <LoadingSpinner message="Chargement des PixelBoards terminés..." />
        ) : completedBoardsError ? (
          <ErrorMessage message={completedBoardsError} onRetry={loadCompletedBoards} />
        ) : completedBoards.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Aucun PixelBoard terminé pour le moment.
          </p>
        ) : (
          <div className="boards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {completedBoards.map((board) => (
              <div
                key={board.id}
                className="board-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-transform hover:scale-105"
              >
                <PixelBoardPreview board={board} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
