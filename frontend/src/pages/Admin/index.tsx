// src/pages/Admin/index.tsx (mise à jour)
import React, { useEffect, useState } from 'react';
import PixelBoardManagement from './PixelBoardManagement';
import UserManagement from './components/UserManagement';
import ApiService from '@/services/api.service';
import '../../styles/admin-dashboard.css';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pixelboards' | 'users'>('dashboard');
  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Charger les statistiques au montage du composant
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);

      try {
        const response = await ApiService.getGlobalStats();
        if (response.error) {
          setStatsError(response.error);
        } else {
          setStats(response.data);
        }
      } catch (err: any) {
        setStatsError(err.message || 'Une erreur est survenue lors du chargement des statistiques');
      } finally {
        setStatsLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  return (
    <div className="admin-page">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>

      {/* Onglets de navigation */}
      <div className="admin-navigation mb-6">
        <nav className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Tableau de bord
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'pixelboards' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('pixelboards')}
          >
            PixelBoards
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs
          </button>
        </nav>
      </div>

      {/* Contenu en fonction de l'onglet actif */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
          <h2>Tableau de bord</h2>

          {statsLoading ? (
            <div className="loading-spinner">Chargement des statistiques...</div>
          ) : statsError ? (
            <div className="error-message">
              <p>{statsError}</p>
              <button onClick={() => setActiveTab('dashboard')}>Réessayer</button>
            </div>
          ) : (
            <div className="stats-widgets">
              <div className="stats-widget stats-widget-blue">
                <h3>Utilisateurs</h3>
                <p className="value">{stats?.totalUsers || 0}</p>
                <p className="trend">
                  <span className="trend-up">+12%</span> depuis le mois dernier
                </p>
              </div>

              <div className="stats-widget stats-widget-green">
                <h3>Tableaux Actifs</h3>
                <p className="value">{stats?.activeBoards || 0}</p>
                <p className="trend">
                  Sur {stats?.totalBoards || 0} tableaux au total
                </p>
              </div>

              <div className="stats-widget stats-widget-purple">
                <h3>Pixels Placés</h3>
                <p className="value">{stats?.totalPixelsPlaced?.toLocaleString() || 0}</p>
                <p className="trend">
                  <span className="trend-up">+8.5K</span> nouvelles contributions
                </p>
              </div>

              <div className="stats-widget stats-widget-yellow">
                <h3>Taux d'Engagement</h3>
                <p className="value">78%</p>
                <p className="trend">
                  <span className="trend-down">-3%</span> depuis la dernière semaine
                </p>
              </div>
            </div>
          )}

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h3>Activité Récente</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon"></div>
                  <div className="activity-details">
                    <p>Nouveau tableau "Art Rétro" créé</p>
                    <p className="activity-time">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon"></div>
                  <div className="activity-details">
                    <p>5 nouveaux utilisateurs inscrits</p>
                    <p className="activity-time">Il y a 1 jour</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon"></div>
                  <div className="activity-details">
                    <p>Tableau "Paysage de Montagne" complété</p>
                    <p className="activity-time">Il y a 3 jours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Actions Rapides</h3>
              <div className="quick-actions">
                <button
                  className="quick-action-button"
                  onClick={() => setActiveTab('pixelboards')}
                >
                  Créer un PixelBoard
                </button>
                <button className="quick-action-button">
                  Voir les Statistiques
                </button>
                <button className="quick-action-button">
                  Gérer les Utilisateurs
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'pixelboards' && <PixelBoardManagement />}

        {activeTab === 'users' && (
          <div className="users-content">
            <UserManagement />
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
