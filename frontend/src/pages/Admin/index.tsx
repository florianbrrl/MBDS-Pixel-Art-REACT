import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard, User } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';

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
        <h2 className="text-2xl font-semibold mb-4">Tableau de bord</h2>
        
        {/* Widgets de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stats-widget bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Utilisateurs</h3>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              <span className="text-green-500">+12%</span> depuis le mois dernier
            </p>
          </div>
          
          <div className="stats-widget bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Tableaux Actifs</h3>
            <p className="text-3xl font-bold">{stats?.activeBoards || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Sur {stats?.totalBoards || 0} tableaux au total
            </p>
          </div>
          
          <div className="stats-widget bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Pixels Placés</h3>
            <p className="text-3xl font-bold">{stats?.totalPixelsPlaced?.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              <span className="text-green-500">+8.5K</span> nouvelles contributions
            </p>
          </div>
          
          <div className="stats-widget bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Taux d'Engagement</h3>
            <p className="text-3xl font-bold">78%</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              <span className="text-red-500">-3%</span> depuis la dernière semaine
            </p>
          </div>
        </div>
        
        {/* Tableau des tableaux récents et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tableaux récents */}
          <div className="recent-boards bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Tableaux Récents</h3>
            {boards.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Aucun tableau trouvé.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-2">Titre</th>
                      <th className="text-left py-2">Statut</th>
                      <th className="text-left py-2">Date de fin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boards.slice(0, 5).map((board) => (
                      <tr key={board.id} className="border-b dark:border-gray-700">
                        <td className="py-2">{board.title}</td>
                        <td className="py-2">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded ${
                              board.is_active
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {board.is_active ? 'Actif' : 'Terminé'}
                          </span>
                        </td>
                        <td className="py-2">{new Date(board.end_time).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {boards.length > 5 && (
                  <div className="mt-3 text-right">
                    <button 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      onClick={() => setActiveTab('boards')}
                    >
                      Voir tous les tableaux →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Alertes et notifications */}
          <div className="alerts bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Alertes et Notifications</h3>
            {alerts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Aucune alerte à afficher.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`alert-item p-3 rounded-md ${
                      alert.read ? 'opacity-70' : ''
                    } ${
                      alert.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' :
                      alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500' :
                      alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500' :
                      'bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${
                        alert.type === 'info' ? 'text-blue-800 dark:text-blue-200' :
                        alert.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        alert.type === 'error' ? 'text-red-800 dark:text-red-200' :
                        'text-green-800 dark:text-green-200'
                      }`}>
                        {alert.message}
                      </p>
                      <div className="flex space-x-2">
                        {!alert.read && (
                          <button 
                            onClick={() => markAlertAsRead(alert.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => deleteAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(alert.date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Raccourcis d'accès rapide */}
        <div className="quick-access mt-8">
          <h3 className="text-xl font-semibold mb-4">Accès Rapide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setIsCreatingBoard(true)}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Créer un Tableau</span>
            </button>
            
            <button
              onClick={() => setActiveTab('boards')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Gérer les Tableaux</span>
            </button>
            
            <button 
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              onClick={() => window.location.href = '/profile'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-800 dark:text-gray-200 font-medium">Mon Profil</span>
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
        <h2 className="text-2xl font-semibold mb-4">Gérer les PixelBoards</h2>

        <div className="admin-actions mb-8">
          {!isCreatingBoard ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                setIsCreatingBoard(true);
                setEditingBoardId(null);
                setBoardForm(defaultBoardForm);
              }}
            >
              Créer un nouveau PixelBoard
            </button>
          ) : (
            <div className="board-form bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <h2 className="text-2xl font-semibold mb-4">
                {editingBoardId ? 'Modifier le PixelBoard' : 'Créer un nouveau PixelBoard'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="title" className="block mb-1">
                    Titre:
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={boardForm.title}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                    placeholder="Titre du PixelBoard"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="width" className="block mb-1">
                      Largeur:
                    </label>
                    <input
                      type="number"
                      id="width"
                      name="width"
                      value={boardForm.width}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                      min="10"
                      max="1000"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height" className="block mb-1">
                      Hauteur:
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={boardForm.height}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                      min="10"
                      max="1000"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cooldown" className="block mb-1">
                    Délai entre placements (secondes):
                  </label>
                  <input
                    type="number"
                    id="cooldown"
                    name="cooldown"
                    value={boardForm.cooldown}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allow_overwrite"
                      checked={boardForm.allow_overwrite}
                      onChange={handleFormChange}
                      className="mr-2"
                    />
                    Autoriser l'écrasement des pixels
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="start_time" className="block mb-1">
                      Date de début:
                    </label>
                    <input
                      type="date"
                      id="start_time"
                      name="start_time"
                      value={boardForm.start_time}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_time" className="block mb-1">
                      Date de fin:
                    </label>
                    <input
                      type="date"
                      id="end_time"
                      name="end_time"
                      value={boardForm.end_time}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingBoardId ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
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
          <p className="text-gray-600 dark:text-gray-400">Aucun PixelBoard trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 shadow rounded-lg">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-3 px-4 text-left">Titre</th>
                  <th className="py-3 px-4 text-left">Dimensions</th>
                  <th className="py-3 px-4 text-left">Statut</th>
                  <th className="py-3 px-4 text-left">Date de fin</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => (
                  <tr key={board.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">{board.title}</td>
                    <td className="py-3 px-4">
                      {board.width}x{board.height}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          board.is_active
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {board.is_active ? 'Actif' : 'Terminé'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(board.end_time).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                          onClick={() => handleEditBoard(board)}
                        >
                          Modifier
                        </button>
                        <button
                          className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administration</h1>
        
        {/* Afficher le nombre de notifications non lues s'il y en a */}
        {alerts.filter(a => !a.read).length > 0 && (
          <div className="relative">
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {alerts.filter(a => !a.read).length}
            </span>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation entre les sections */}
      <div className="admin-navigation mb-8">
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <ul className="flex overflow-x-auto">
            <li>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Tableau de bord
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('boards')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'boards'
                    ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
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