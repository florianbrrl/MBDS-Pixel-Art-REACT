import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PixelBoardPreview from '@/components/pixel-board/PixelBoardPreview';

const PixelBoards: React.FC = () => {
  // États pour les données
  const [activeBoards, setActiveBoards] = useState<PixelBoard[]>([]);
  const [completedBoards, setCompletedBoards] = useState<PixelBoard[]>([]);

  // États de filtre et de tri
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name'>('latest');

  // États de chargement
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les PixelBoards
  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true);
      setError(null);

      try {
        // Charger les PixelBoards actifs
        const activeResponse = await ApiService.getActivePixelBoards();
        if (activeResponse.error) {
          setError(activeResponse.error);
          setLoading(false);
          return;
        }

        // Charger les PixelBoards terminés
        const completedResponse = await ApiService.getCompletedPixelBoards();
        if (completedResponse.error) {
          setError(completedResponse.error);
          setLoading(false);
          return;
        }

        setActiveBoards(activeResponse.data || []);
        setCompletedBoards(completedResponse.data || []);
      } catch (error) {
        setError('Une erreur est survenue lors du chargement des PixelBoards.');
      }

      setLoading(false);
    };

    loadBoards();
  }, []);

  // Fonction pour filtrer les PixelBoards
  const getFilteredBoards = (): PixelBoard[] => {
    if (filter === 'active') return activeBoards;
    if (filter === 'completed') return completedBoards;
    return [...activeBoards, ...completedBoards];
  };

  // Fonction pour trier les PixelBoards
  const getSortedBoards = (): PixelBoard[] => {
    const filtered = getFilteredBoards();

    if (sortBy === 'oldest') {
      return [...filtered].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }

    if (sortBy === 'name') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    // Par défaut, trier par plus récent
    return [...filtered].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  // Gérer le changement de filtre
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as 'all' | 'active' | 'completed');
  };

  // Gérer le changement de tri
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'latest' | 'oldest' | 'name');
  };

  return (
    <div className="pixel-boards-page">
      <h1 className="text-3xl font-bold mb-4">Tous les PixelBoards</h1>
      <p className="text-lg mb-6">Explorez les PixelBoards créés par la communauté</p>

      {loading ? (
        <LoadingSpinner message="Chargement des PixelBoards..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <div className="filters-and-sorts flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="filter mb-4 sm:mb-0">
              <label htmlFor="filter" className="mr-2">
                Filtrer:
              </label>
              <select
                id="filter"
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                value={filter}
                onChange={handleFilterChange}
              >
                <option value="all">Tous</option>
                <option value="active">Actifs uniquement</option>
                <option value="completed">Terminés uniquement</option>
              </select>
            </div>
            <div className="sort">
              <label htmlFor="sort" className="mr-2">
                Trier par:
              </label>
              <select
                id="sort"
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="latest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="name">Nom</option>
              </select>
            </div>
          </div>

          <div className="boards-stats mb-4">
            <p>
              {getSortedBoards().length} PixelBoard{getSortedBoards().length > 1 ? 's' : ''} trouvé
              {getSortedBoards().length > 1 ? 's' : ''}
              {filter !== 'all' && <> ({filter === 'active' ? 'actifs' : 'terminés'})</>}
            </p>
          </div>

          {getSortedBoards().length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              Aucun PixelBoard trouvé avec les filtres actuels.
            </p>
          ) : (
            <div className="boards-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {getSortedBoards().map((board) => (
                <div
                  key={board.id}
                  className="board-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-transform hover:scale-105"
                >
                  <PixelBoardPreview board={board} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PixelBoards;
