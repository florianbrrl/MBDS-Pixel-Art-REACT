import React, { useState, useEffect } from 'react';
import SuperPixelBoard from '@/components/super-board/SuperPixelBoard';
import PixelBoardService from '@/services/pixelboard.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import './../../styles/SuperPixelBoardPage.css';

const SuperPixelBoardPage: React.FC = () => {
  const [boardsData, setBoardsData] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixelInfo, setPixelInfo] = useState<{
    x: number;
    y: number;
    color: string;
    boardId: string;
    boardTitle: string;
  } | null>(null);
  const [filterActive, setFilterActive] = useState(true);
  const [filterInactive, setFilterInactive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSuperPixelBoardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await PixelBoardService.getSuperPixelBoardData();

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setBoardsData(response.data.boards);
          setDimensions(response.data.dimensions);
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchSuperPixelBoardData();
  }, []);

  const handlePixelHover = (x: number, y: number, color: string, boardId: string, boardTitle: string) => {
    setPixelInfo({ x, y, color, boardId, boardTitle });
  };

  // Filtrer les boards selon les critères
  const getFilteredBoards = () => {
    return boardsData.filter(board => {
      // Filtre actif/inactif
      if (!(filterActive && board.is_active) && !(filterInactive && !board.is_active)) {
        return false;
      }

      // Filtre de recherche
      if (searchQuery.trim() !== '') {
        return board.title.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    });
  };

  const filteredBoards = getFilteredBoards();

  if (loading) {
    return <LoadingSpinner message="Chargement du SuperPixelBoard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="super-pixelboard-page">
      <div className="page-header">
        <h1>SuperPixelBoard</h1>
        <p className="page-description">
          Visualisez toutes les créations PixelBoard combinées en une seule toile
        </p>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={filterActive}
              onChange={(e) => setFilterActive(e.target.checked)}
            />
            Tableaux actifs
          </label>
          <label>
            <input
              type="checkbox"
              checked={filterInactive}
              onChange={(e) => setFilterInactive(e.target.checked)}
            />
            Tableaux terminés
          </label>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un tableau..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="board-stats">
        <div className="stats-item">
          <span className="stats-label">Tableaux affichés:</span>
          <span className="stats-value">{filteredBoards.length}</span>
        </div>
      </div>

      <div className="super-board-container">
        <SuperPixelBoard
          boardsData={filteredBoards}
          width={dimensions.width}
          height={dimensions.height}
          onPixelHover={handlePixelHover}
        />
      </div>

      <div className="included-boards">
        <h2>Tableaux inclus ({filteredBoards.length})</h2>
        <div className="boards-list">
          {filteredBoards.map(board => (
            <div key={board.id} className="board-item">
              <span className="board-title">{board.title}</span>
              <span className={`board-status ${board.is_active ? 'active' : 'inactive'}`}>
                {board.is_active ? 'Actif' : 'Terminé'}
              </span>
              <a href={`/pixel-boards/${board.id}`} className="view-link">
                Voir
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperPixelBoardPage;
