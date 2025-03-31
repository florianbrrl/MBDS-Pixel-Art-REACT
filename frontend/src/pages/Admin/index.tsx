// src/pages/Admin/index.tsx (mise à jour)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelBoardManagement from './PixelBoardManagement';
import UserManagement from './components/UserManagement';
import ApiService from '@/services/api.service';
import '../../styles/admin-dashboard.css';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pixelboards' | 'users'>('dashboard');
  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        </nav>
      </div>

      {/* Contenu en fonction de l'onglet actif */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
          <h2>Tableau de bord</h2>

          {statsLoading ? (
            <div>Chargement des statistiques...</div>
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
              </div>

              <div className="stats-widget stats-widget-green">
                <h3>Tableaux Actifs</h3>
                <p className="value">{stats?.activeBoards || 0}</p>
              </div>

              <div className="stats-widget stats-widget-purple">
                <h3>Pixels Placés</h3>
                <p className="value">{stats?.totalPixelsPlaced?.toLocaleString() || 0}</p>
              </div>
            </div>
          )}

          <div className="dashboard-sections">
            <div className="dashboard-section">
              <h3>Actions Rapides</h3>
              <div className="quick-actions">
                <button
                  className="quick-action-button"
                  onClick={() => setActiveTab('pixelboards')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="quick-action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <span>Créer un PixelBoard</span>
                </button>
                <button
                  className="quick-action-button"
                  onClick={() => navigate('/contributions')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="quick-action-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <span>Voir les Statistiques</span>
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
