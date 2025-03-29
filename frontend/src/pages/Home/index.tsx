import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import PixelBoardPreview from '@/components/pixel-board/PixelBoardPreview';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import '../../styles/home.css';

const Home: React.FC = () => {
  // États pour les données
  const [stats, setStats] = useState<{ totalUsers?: number; totalBoards?: number; activeBoards?: number } | null>(null);
  const [activeBoards, setActiveBoards] = useState<PixelBoard[]>([]);
  const [completedBoards, setCompletedBoards] = useState<PixelBoard[]>([]);

  // États pour le chargement
  const [statsLoading, setStatsLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);

  // États pour les erreurs
  const [statsError, setStatsError] = useState<string | null>(null);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  // Récupérer le statut d'authentification
  const { isAuthenticated } = useAuth();

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
    loadBoards();
  }, [isAuthenticated]);

  // Fonction pour charger les statistiques
  const loadStats = async () => {
    if (!isAuthenticated) return;

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
      let activeResponse, completedResponse;

      if (isAuthenticated) {
        // Utiliser les routes authentifiées pour les utilisateurs connectés
        activeResponse = await ApiService.getActivePixelBoards();
        completedResponse = await ApiService.getCompletedPixelBoards();
      } else {
        // Utiliser les routes publiques pour les utilisateurs non connectés
        activeResponse = await ApiService.getPublicActivePixelBoards();
        completedResponse = await ApiService.getPublicCompletedPixelBoards();
      }

      if (!activeResponse.error) {
        setActiveBoards(activeResponse.data || []);
      }

      if (!completedResponse.error) {
        setCompletedBoards(completedResponse.data || []);
      }

      // Si les deux tableaux sont vides après les tentatives, afficher une erreur
      if (
        (activeBoards.length === 0 && completedBoards.length === 0) &&
        ((activeResponse.error || activeResponse.data?.length === 0) &&
        (completedResponse.error || completedResponse.data?.length === 0))
      ) {
        setBoardsError('Impossible de charger les PixelBoards');
      }
    } catch (error: any) {
      setBoardsError('Impossible de charger les PixelBoards');
    } finally {
      setBoardsLoading(false);
    }
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

      <section className="feature-section">
        <h2 className="section-title">SuperPixelBoard</h2>
        <div className="feature-card">
          <div className="feature-description">
            <h3>Explorez le SuperPixelBoard</h3>
            <p>
              Découvrez toutes les créations PixelBoard combinées en une seule toile
              géante. Voyez comment la communauté a contribué à travers les différents
              tableaux et explorez l'art pixel collaboratif.
            </p>
            <Link to="/super-board" className="cta-button">
              Voir le SuperPixelBoard
            </Link>
          </div>
        </div>
      </section>

      {/* Afficher les statistiques uniquement si l'utilisateur est connecté */}
      {isAuthenticated && (
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
      )}

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

      {/* Section alternative pour les utilisateurs non connectés */}
      {!isAuthenticated && (
        <section className="login-prompt-section">
          <div className="login-prompt-card">
            <h2>Connectez-vous pour plus de fonctionnalités</h2>
            <p>Connectez-vous pour voir les statistiques, contribuer aux tableaux et créer vos propres pixel arts.</p>
            <div className="login-prompt-actions">
              <Link to="/login" className="login-button">Se connecter</Link>
              <Link to="/register" className="register-button">S'inscrire</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
