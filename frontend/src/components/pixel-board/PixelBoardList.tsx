import React, { useState } from 'react';
import { PixelBoard } from '@/types';
import PixelBoardCard from './PixelBoardCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import '../../styles/PixelBoardList.css';

interface PixelBoardListProps {
  boards: PixelBoard[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const PixelBoardList: React.FC<PixelBoardListProps> = ({
  boards,
  loading,
  error,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'name'>('latest');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les PixelBoards en fonction des critères
  const getFilteredBoards = (): PixelBoard[] => {
    let filteredBoards = [...boards];

    // Filtre par statut
    if (filter === 'active') {
      filteredBoards = filteredBoards.filter(board => board.is_active);
    } else if (filter === 'completed') {
      filteredBoards = filteredBoards.filter(board => !board.is_active);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredBoards = filteredBoards.filter(board =>
        board.title.toLowerCase().includes(query)
      );
    }

    // Tri
    if (sortBy === 'oldest') {
      filteredBoards.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === 'name') {
      filteredBoards.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Par défaut, trier par plus récent
      filteredBoards.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filteredBoards;
  };

  const filteredBoards = getFilteredBoards();

  if (loading) {
    return <LoadingSpinner message="Chargement des PixelBoards..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRefresh} />;
  }

  return (
    <div className="pixelboard-list-container">
      <div className="pixelboard-list-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un PixelBoard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-sort-container">
          <div className="filter-dropdown">
            <label htmlFor="filter">Filtrer par:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
            >
              <option value="all">Tous</option>
              <option value="active">Actifs uniquement</option>
              <option value="completed">Terminés uniquement</option>
            </select>
          </div>

          <div className="sort-dropdown">
            <label htmlFor="sort">Trier par:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'oldest' | 'name')}
            >
              <option value="latest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
              <option value="name">Nom</option>
            </select>
          </div>
        </div>
      </div>

      <div className="boards-stats">
        <span className="boards-count">
          {filteredBoards.length} PixelBoard{filteredBoards.length !== 1 ? 's' : ''} trouvé
          {filteredBoards.length !== 1 ? 's' : ''}
          {filter !== 'all' && <> ({filter === 'active' ? 'actifs' : 'terminés'})</>}
        </span>
      </div>

      {filteredBoards.length === 0 ? (
        <div className="no-boards-message">
          <p>Aucun PixelBoard trouvé avec les filtres actuels.</p>
        </div>
      ) : (
        <div className="pixelboard-grid">
          {filteredBoards.map(board => (
            <PixelBoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PixelBoardList;
