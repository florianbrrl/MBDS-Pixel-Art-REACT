import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard, User } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/admin-dashboard.css';

// Types pour les statistiques
interface AdminStats {
  totalUsers: number;
  totalBoards: number;
  activeBoards: number;
  totalPixelsPlaced: number;
}

// Type pour les alertes
interface AdminAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  date: string;
  read: boolean;
}

const Admin: React.FC = () => {
  // États pour les données
  const [boards, setBoards] = useState<PixelBoard[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'boards' | 'users'>('dashboard');

  // Référence au contexte d'authentification
  const { currentUser } = useAuth();

  // État pour le mode d'édition
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);

  // État pour le mode de création
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // Formulaire par défaut pour la création d'un PixelBoard
  const defaultBoardForm = {
    title: '',
    width: 32,
    height: 32,
    cooldown: 60,
    allow_overwrite: false,
    start_time: getTomorrowDate(),
    end_time: getNextWeekDate(),
  };

  // État pour le formulaire de création/édition
  const [boardForm, setBoardForm] = useState(defaultBoardForm);

  // Fonctions utilitaires pour les dates
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  function getNextWeekDate() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  // Charger les données nécessaires au tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Charger les PixelBoards
        const boardsResponse = await ApiService.getAllPixelBoards();
        if (boardsResponse.error) {
          throw new Error(boardsResponse.error);
        }
        setBoards(boardsResponse.data || []);

        // Charger les statistiques globales
        setStatsLoading(true);
        const statsResponse = await ApiService.getGlobalStats();
        if (statsResponse.error) {
          throw new Error(statsResponse.error);
        }
        setStats(statsResponse.data);
        setStatsLoading(false);

        // Simuler des alertes pour la démo (dans un projet réel, cela pourrait venir de l'API)
        const mockAlerts: AdminAlert[] = [
          {
            id: 'alert-1',
            type: 'warning',
            message: 'Forte affluence sur le tableau "Pixel Art Rétro" - surveillance recommandée',
            date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            read: false,
          },
          {
            id: 'alert-2',
            type: 'info',
            message: 'Mise à jour du système prévue demain à 03:00',
            date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
            read: true,
          },
          {
            id: 'alert-3',
            type: 'success',
            message: 'Le tableau "Espace Cosmique" a été complété avec succès',
            date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            read: false,
          },
          {
            id: 'alert-4',
            type: 'error',
            message: 'Erreur lors de la création du tableau "Monde Aquatique"',
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
          },
        ];
        setAlerts(mockAlerts);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Gérer le changement de valeur du formulaire
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBoardForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setBoardForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // En mode mock, nous simulons simplement l'ajout/modification
    if (editingBoardId) {
      // Simuler la mise à jour
      const updatedBoards = boards.map((board) =>
        board.id === editingBoardId
          ? {
              ...board,
              title: boardForm.title,
              width: Number(boardForm.width),
              height: Number(boardForm.height),
              cooldown: Number(boardForm.cooldown),
              allow_overwrite: boardForm.allow_overwrite,
              start_time: new Date(boardForm.start_time).toISOString(),
              end_time: new Date(boardForm.end_time).toISOString(),
            }
          : board,
      );

      setBoards(updatedBoards);
      setEditingBoardId(null);
    } else {
      // Simuler la création
      const newBoard: PixelBoard = {
        id: `board-${Date.now()}`,
        title: boardForm.title,
        width: Number(boardForm.width),
        height: Number(boardForm.height),
        grid: {}, // Grille vide pour un nouveau PixelBoard
        cooldown: Number(boardForm.cooldown),
        allow_overwrite: boardForm.allow_overwrite,
        start_time: new Date(boardForm.start_time).toISOString(),
        end_time: new Date(boardForm.end_time).toISOString(),
        is_active: new Date() < new Date(boardForm.end_time),
        created_at: new Date().toISOString(),
        admin_id: currentUser?.id || 'user-1', // L'ID de l'administrateur actuel
      };

      setBoards([newBoard, ...boards]);
      
      // Mettre à jour les statistiques
      setStats(prev => prev ? {
        ...prev,
        totalBoards: prev.totalBoards + 1,
        activeBoards: prev.activeBoards + 1
      } : null);
      
      // Ajouter une alerte
      const newAlert: AdminAlert = {
        id: `alert-${Date.now()}`,
        type: 'success',
        message: `Nouveau tableau "${boardForm.title}" créé avec succès`,
        date: new Date().toISOString(),
        read: false
      };
      setAlerts([newAlert, ...alerts]);
    }

    // Réinitialiser le formulaire
    setBoardForm(defaultBoardForm);
    setIsCreatingBoard(false);
  };

  // Gérer la modification d'un PixelBoard
  const handleEditBoard = (board: PixelBoard) => {
    setEditingBoardId(board.id);
    setBoardForm({
      title: board.title,
      width: board.width,
      height: board.height,
      cooldown: board.cooldown,
      allow_overwrite: board.allow_overwrite,
      start_time: new Date(board.start_time).toISOString().split('T')[0],
      end_time: new Date(board.end_time).toISOString().split('T')[0],
    });
    setIsCreatingBoard(true);
  };

  // Gérer la suppression d'un PixelBoard
  const handleDeleteBoard = (boardId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce PixelBoard ?')) {
      // Simuler la suppression
      const boardToDelete = boards.find(b => b.id === boardId);
      const updatedBoards = boards.filter((board) => board.id !== boardId);
      setBoards(updatedBoards);
      
      // Mettre à jour les statistiques
      if (boardToDelete && stats) {
        setStats({
          ...stats,
          totalBoards: stats.totalBoards - 1,
          activeBoards: boardToDelete.is_active ? stats.activeBoards - 1 : stats.activeBoards
        });
      }
      
      // Ajouter une alerte
      const boardTitle = boardToDelete?.title || "Inconnu";
      const newAlert: AdminAlert = {
        id: `alert-${Date.now()}`,
        type: 'info',
        message: `Tableau "${boardTitle}" supprimé avec succès`,
        date: new Date().toISOString(),
        read: false
      };
      setAlerts([newAlert, ...alerts]);
    }
  };
  
  // Marquer une alerte comme lue
  const markAlertAsRead = (alertId: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };
  
  // Supprimer une alerte
  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId));
  };

  // Composant de tableau de bord
  const renderDashboard = () => {
    if (statsLoading) {
      return <LoadingSpinner message="Chargement des statistiques..." />;
    }

    return (
      <div className="dashboard-content">
        <h2>Tableau de bord</h2>
        
        {/* Widgets de statistiques */}
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
        
        {/* Tableau des tableaux récents et alertes */}
        <div className="dashboard-sections">
          {/* Tableaux récents */}
          <div className="dashboard-section">
            <h3>Tableaux Récents</h3>
            {boards.length === 0 ? (
              <p className="text-secondary">Aucun tableau trouvé.</p>
            ) : (
              <div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Statut</th>
                      <th>Date de fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boards.slice(0, 5).map((board) => (
                      <tr key={board.id}>
                        <td>{board.title}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              board.is_active
                                ? 'status-active'
                                : 'status-inactive'
                            }`}
                          >
                            {board.is_active ? 'Actif' : 'Terminé'}
                          </span>
                        </td>
                        <td>{new Date(board.end_time).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {boards.length > 5 && (
                  <button 
                    className="view-all-link"
                    onClick={() => setActiveTab('boards')}
                  >
                    Voir tous les tableaux →
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Alertes et notifications */}
          <div className="dashboard-section">
            <h3>Alertes et Notifications</h3>
            {alerts.length === 0 ? (
              <p className="text-secondary">Aucune alerte à afficher.</p>
            ) : (
              <div className="alerts-container">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`alert-item alert-${alert.type} ${
                      alert.read ? 'alert-read' : ''
                    }`}
                  >
                    <div className="alert-actions">
                      {!alert.read && (
                        <button 
                          className="alert-button"
                          onClick={() => markAlertAsRead(alert.id)}
                          aria-label="Marquer comme lu"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button 
                        className="alert-button"
                        onClick={() => deleteAlert(alert.id)}
                        aria-label="Supprimer l'alerte"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="alert-message">{alert.message}</p>
                    <p className="alert-timestamp">
                      {new Date(alert.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Raccourcis d'accès rapide */}
        <div className="quick-access">
          <h3>Accès Rapide</h3>
          <div className="quick-access-buttons">
            <button
              onClick={() => setIsCreatingBoard(true)}
              className="quick-access-button quick-access-blue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="quick-access-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="quick-access-label">Créer un Tableau</span>
            </button>
            
            <button
              onClick={() => setActiveTab('boards')}
              className="quick-access-button quick-access-purple"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="quick-access-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="quick-access-label">Gérer les Tableaux</span>
            </button>
            
            <button 
              className="quick-access-button quick-access-green"
              onClick={() => window.location.href = '/profile'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="quick-access-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="quick-access-label">Mon Profil</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Composant de gestion des tableaux
  const renderBoards = () => {
    return (
      <div className="admin-boards-list">
        <h2>Gérer les PixelBoards</h2>

        <div className="admin-actions">
          {!isCreatingBoard ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsCreatingBoard(true);
                setEditingBoardId(null);
                setBoardForm(defaultBoardForm);
              }}
            >
              Créer un nouveau PixelBoard
            </button>
          ) : (
            <div className="board-form">
              <h2>
                {editingBoardId ? 'Modifier le PixelBoard' : 'Créer un nouveau PixelBoard'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">
                    Titre:
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={boardForm.title}
                    onChange={handleFormChange}
                    placeholder="Titre du PixelBoard"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="width">
                      Largeur:
                    </label>
                    <input
                      type="number"
                      id="width"
                      name="width"
                      value={boardForm.width}
                      onChange={handleFormChange}
                      min="10"
                      max="1000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height">
                      Hauteur:
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={boardForm.height}
                      onChange={handleFormChange}
                      min="10"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cooldown">
                    Délai entre placements (secondes):
                  </label>
                  <input
                    type="number"
                    id="cooldown"
                    name="cooldown"
                    value={boardForm.cooldown}
                    onChange={handleFormChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="allow_overwrite"
                      checked={boardForm.allow_overwrite}
                      onChange={handleFormChange}
                    />
                    Autoriser l'écrasement des pixels
                  </label>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="start_time">
                      Date de début:
                    </label>
                    <input
                      type="date"
                      id="start_time"
                      name="start_time"
                      value={boardForm.start_time}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_time">
                      Date de fin:
                    </label>
                    <input
                      type="date"
                      id="end_time"
                      name="end_time"
                      value={boardForm.end_time}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingBoardId ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsCreatingBoard(false);
                      setEditingBoardId(null);
                      setBoardForm(defaultBoardForm);
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Chargement des PixelBoards..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => window.location.reload()} />
        ) : boards.length === 0 ? (
          <p className="text-secondary">Aucun PixelBoard trouvé.</p>
        ) : (
          <div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Dimensions</th>
                  <th>Statut</th>
                  <th>Date de fin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => (
                  <tr key={board.id}>
                    <td>{board.title}</td>
                    <td>
                      {board.width}x{board.height}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          board.is_active
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {board.is_active ? 'Actif' : 'Terminé'}
                      </span>
                    </td>
                    <td>{new Date(board.end_time).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="action-button btn-edit"
                          onClick={() => handleEditBoard(board)}
                        >
                          Modifier
                        </button>
                        <button
                          className="action-button btn-delete"
                          onClick={() => handleDeleteBoard(board.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Administration</h1>
        
        {/* Afficher le nombre de notifications non lues s'il y en a */}
        {alerts.filter(a => !a.read).length > 0 && (
          <div className="notification-container">
            <span className="notification-badge">
              {alerts.filter(a => !a.read).length}
            </span>
            <button className="notification-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation entre les sections */}
      <div className="admin-navigation">
        <nav>
          <ul>
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={activeTab === 'dashboard' ? 'active' : ''}
              >
                Tableau de bord
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('boards')}
                className={activeTab === 'boards' ? 'active' : ''}
              >
                Gérer les PixelBoards
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Contenu principal selon l'onglet actif */}
      {loading && !isCreatingBoard ? (
        <LoadingSpinner message="Chargement des données..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'boards' && renderBoards()}
        </>
      )}
    </div>
  );
};

export default Admin;