import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ThemeSelector from '@/components/common/ThemeSelector';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();

  // États pour les contributions utilisateur
  const [contributions, setContributions] = useState<{
    totalPixels: number;
    boardsContributed: string[];
  } | null>(null);

  // États pour les PixelBoards contribués
  const [contributedBoards, setContributedBoards] = useState<PixelBoard[]>([]);

  // États de chargement
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [boardsLoading, setBoardsLoading] = useState(true);

  // États d'erreur
  const [contributionsError, setContributionsError] = useState<string | null>(null);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  // Charger les contributions de l'utilisateur
  useEffect(() => {
    const loadContributions = async () => {
      if (!currentUser) return;

      setContributionsLoading(true);
      setContributionsError(null);

      const response = await ApiService.getUserContributions(currentUser.id);

      if (response.error) {
        setContributionsError(response.error);
      } else {
        setContributions(response.data || { totalPixels: 0, boardsContributed: [] });
      }

      setContributionsLoading(false);
    };

    loadContributions();
  }, [currentUser]);

  // Charger les détails des PixelBoards contribués
  useEffect(() => {
    const loadContributedBoards = async () => {
      if (!contributions || !contributions.boardsContributed.length) {
        setBoardsLoading(false);
        return;
      }

      setBoardsLoading(true);
      setBoardsError(null);

      const boardDetails: PixelBoard[] = [];

      try {
        // Pour chaque PixelBoard contribué, récupérer ses détails
        for (const boardId of contributions.boardsContributed) {
          const response = await ApiService.getPixelBoardById(boardId);
          if (response.data) {
            boardDetails.push(response.data);
          }
        }

        setContributedBoards(boardDetails);
      } catch (error) {
        setBoardsError('Impossible de récupérer les détails des PixelBoards contribués');
      }

      setBoardsLoading(false);
    };

    loadContributedBoards();
  }, [contributions]);

  if (!currentUser) {
    return (
      <div className="profile-page">
        <ErrorMessage message="Vous devez être connecté pour accéder à votre profil." />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>

      <div className="profile-info mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
          <p className="mb-2">
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p className="mb-2">
            <strong>Compte créé le:</strong> {new Date(currentUser.created_at).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Préférences</h2>
          <div className="mb-4">
            <label className="block mb-2">Thème de l'application:</label>
            <ThemeSelector className="w-full md:w-auto" />
          </div>
        </div>
      </div>

      <div className="user-contributions mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mes Contributions</h2>

        {contributionsLoading ? (
          <LoadingSpinner message="Chargement de vos contributions..." />
        ) : contributionsError ? (
          <ErrorMessage message={contributionsError} />
        ) : contributions ? (
          <div className="stats-container grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="stat-item bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl mb-2">Pixels Placés</h3>
              <p className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400">
                {contributions.totalPixels}
              </p>
            </div>
            <div className="stat-item bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-xl mb-2">PixelBoards</h3>
              <p className="stat-number text-4xl font-bold text-blue-600 dark:text-blue-400">
                {contributions.boardsContributed.length}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Aucune contribution trouvée.</p>
        )}
      </div>

      {contributions && contributions.boardsContributed.length > 0 && (
        <div className="contributed-boards">
          <h2 className="text-2xl font-semibold mb-4">PixelBoards auxquels j'ai contribué</h2>

          {boardsLoading ? (
            <LoadingSpinner message="Chargement des PixelBoards..." />
          ) : boardsError ? (
            <ErrorMessage message={boardsError} />
          ) : contributedBoards.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Aucun PixelBoard trouvé.</p>
          ) : (
            <div className="boards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {contributedBoards.map((board) => (
                <div
                  key={board.id}
                  className="board-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{board.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {board.width}x{board.height} pixels
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        board.is_active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {board.is_active ? 'Actif' : 'Terminé'}
                    </span>
                    <a
                      href={`/pixel-boards/${board.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Voir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
