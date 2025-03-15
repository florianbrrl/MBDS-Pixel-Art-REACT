import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import PixelBoardPreview from '@/components/pixel-board/PixelBoardPreview';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import '../../styles/home.css';

const Home: React.FC = () => {
  // États pour les données
  const [stats, setStats] = useState<{ totalUsers?: number; totalBoards?: number; activeBoards?: number } | null>(null);
  const [activeBoards, setActiveBoards] = useState<PixelBoard[]>([]);
  const [completedBoards, setCompletedBoards] = useState<PixelBoard[]>([]);

  // États pour le chargement
  const [statsLoading, setStatsLoading] = useState(true);
  const [boardsLoading, setBoardsLoading] = useState(true);

  // États pour les erreurs
  const [statsError, setStatsError] = useState<string | null>(null);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadStats();
    loadBoards();
  }, []);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError(null);

    try {
      const response = await ApiService.getGlobalStats();

      if (response.error) {
        setStatsError(response.error);
      } else {
        setStats(response.data || { totalUsers: 0, totalBoards: 0, activeBoards: 0 });
      }
    } catch (error: any) {
      setStatsError('Impossible de charger les statistiques');
    }

    setStatsLoading(false);
  };

  // Fonction pour charger les PixelBoards
  const loadBoards = async () => {
    setBoardsLoading(true);
    setBoardsError(null);

    try {
      // Charger les PixelBoards actifs
      const activeResponse = await ApiService.getActivePixelBoards();

      if (activeResponse.error) {
        setBoardsError(activeResponse.error);
      } else {
        setActiveBoards(activeResponse.data || []);
      }

      // Charger les PixelBoards terminés
      const completedResponse = await ApiService.getCompletedPixelBoards();

      if (!activeResponse.error && completedResponse.error) {
        setBoardsError(completedResponse.error);
      } else if (!completedResponse.error) {
        setCompletedBoards(completedResponse.data || []);
      }
    } catch (error: any) {
      setBoardsError('Impossible de charger les PixelBoards');
    }

    setBoardsLoading(false);
  };

  // Rendu des cartes de prévisualisation
  const renderBoardPreview = (board: PixelBoard) => {
    const dimensions = `${board.width}x${board.height}`;
    const isActive = board.is_active ? 'Actif' : 'Terminé';

    return (
      <div key={board.id} className="board-preview">
        <h3 className="board-title">{board.title}</h3>
        <div className="preview-image">
          <PixelBoardPreview board={board} size={120} />
        </div>
        <div className="board-info">
          <span className="board-dimensions">{dimensions}{isActive === 'Actif' ? 'Actif' : ''}</span>
          <Link to={`/pixel-boards/${board.id}`} className="view-link">
            Voir détails
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="main-title">Bienvenue sur PixelArt App</h1>
        <p className="subtitle">Créez et partagez des pixel arts avec la communauté !</p>
      </section>

      <section className="stats-section">
        <h2 className="section-title">Statistiques</h2>

        {statsLoading ? (
          <div className="loading-container">
            <LoadingSpinner message="Chargement des statistiques..." />
          </div>
        ) : statsError ? (
          <ErrorMessage message={statsError} onRetry={loadStats} />
        ) : (
          <div className="stats-container">
            <div className="stat-card">
              <h3 className="stat-title">Utilisateurs</h3>
              <p className="stat-value">{stats?.totalUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">PixelBoards</h3>
              <p className="stat-value">{stats?.totalBoards || 0}</p>
              <p className="stat-caption">dont {stats?.activeBoards || 0} actifs</p>
            </div>
          </div>
        )}
      </section>

      <section className="active-boards-section">
        <h2 className="section-title">PixelBoards en cours</h2>

        {boardsLoading ? (
          <div className="loading-container">
            <LoadingSpinner message="Chargement des PixelBoards..." />
          </div>
        ) : boardsError ? (
          <ErrorMessage message={boardsError} onRetry={loadBoards} />
        ) : activeBoards.length === 0 ? (
          <p className="empty-message">Aucun PixelBoard actif pour le moment.</p>
        ) : (
          <div className="boards-list">
            {activeBoards.slice(0, 8).map(board => renderBoardPreview(board))}
          </div>
        )}

        {activeBoards.length > 0 && (
          <div className="view-all-container">
            <Link to="/pixel-boards" className="view-all-link">
              Voir tous les PixelBoards
            </Link>
          </div>
        )}
      </section>

      {completedBoards.length > 0 && (
        <section className="completed-boards-section">
          <h2 className="section-title">PixelBoards terminés</h2>

          <div className="boards-list">
            {completedBoards.slice(0, 3).map(board => renderBoardPreview(board))}
          </div>

          <div className="view-all-container">
            <Link to="/pixel-boards" className="view-all-link">
              Voir tous les PixelBoards
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
