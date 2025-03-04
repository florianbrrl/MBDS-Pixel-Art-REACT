import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const Admin: React.FC = () => {
  // États pour les données
  const [boards, setBoards] = useState<PixelBoard[]>([]);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Charger les PixelBoards
  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true);
      setError(null);

      const response = await ApiService.getAllPixelBoards();

      if (response.error) {
        setError(response.error);
      } else {
        setBoards(response.data || []);
      }

      setLoading(false);
    };

    loadBoards();
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
        admin_id: 'user-1', // L'ID de l'administrateur actuel
      };

      setBoards([newBoard, ...boards]);
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
      const updatedBoards = boards.filter((board) => board.id !== boardId);
      setBoards(updatedBoards);
    }
  };

  return (
    <div className="admin-page">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>
      <p className="text-lg mb-8">Panneau d'administration des PixelBoards</p>

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

      <div className="admin-boards-list">
        <h2 className="text-2xl font-semibold mb-4">Gérer les PixelBoards</h2>

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
    </div>
  );
};

export default Admin;
