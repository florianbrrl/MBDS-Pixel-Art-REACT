import React, { useState, useEffect } from 'react';
import { PixelBoardService } from '@/services/api.service';
import { PixelBoard } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import PixelBoardForm from './PixelBoardForm';
import PixelBoardPreview from './PixelBoardPreview';
import '@/styles/pixelboard.css';

const PixelBoardManagement: React.FC = () => {
  // États pour les données et l'UI
  const [boards, setBoards] = useState<PixelBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [editingBoard, setEditingBoard] = useState<PixelBoard | null>(null);

  // Charger les PixelBoards au montage du composant
  useEffect(() => {
    loadBoards();
  }, []);

  // Fonction pour charger les PixelBoards
  const loadBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await PixelBoardService.getAllBoards();
      if (response.error) {
        setError(response.error);
      } else {
        setBoards(response.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement des PixelBoards');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un PixelBoard
  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce PixelBoard ?')) {
      return;
    }

    try {
      const response = await PixelBoardService.deleteBoard(id);
      if (response.error) {
        alert(`Erreur: ${response.error}`);
      } else {
        // Mettre à jour la liste après suppression
        setBoards(boards.filter((board) => board.id !== id));
        alert('PixelBoard supprimé avec succès');
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message || 'Une erreur est survenue lors de la suppression'}`);
    }
  };

  // Fonction pour éditer un PixelBoard
  const handleEdit = (board: PixelBoard) => {
    setEditingBoard(board);
    setShowForm(true);
  };

  // Fonction pour ajouter un nouveau PixelBoard
  const handleAdd = () => {
    setEditingBoard(null);
    setShowForm(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBoard(null);
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = async (boardData: any) => {
    try {
      let response;

      if (editingBoard) {
        // Mise à jour
        response = await PixelBoardService.updateBoard(editingBoard.id, boardData);
      } else {
        // Création
        response = await PixelBoardService.createBoard(boardData);
      }

      if (response.error) {
        alert(`Erreur: ${response.error}`);
      } else {
        // Recharger la liste pour afficher les mises à jour
        await loadBoards();
        setShowForm(false);
        setEditingBoard(null);
        alert(editingBoard ? 'PixelBoard mis à jour avec succès' : 'PixelBoard créé avec succès');
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message || 'Une erreur est survenue'}`);
    }
  };

  return (
    <div className="pixel-board-management">
      <h1 className="text-2xl font-bold mb-4">Gestion des PixelBoards</h1>

      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Créer un nouveau PixelBoard
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Chargement des PixelBoards..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadBoards} />
      ) : (
        <div className="boards-list">
          {boards.length === 0 ? (
            <p>Aucun PixelBoard trouvé.</p>
          ) : (
            <table className="min-w-full bg-primary border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">Titre</th>
                  <th className="px-4 py-2 border-b">Dimensions</th>
                  <th className="px-4 py-2 border-b">Statut</th>
                  <th className="px-4 py-2 border-b">Date de fin</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => (
                  <tr key={board.id}>
                    <td className="px-4 py-2 border-b">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <PixelBoardPreview board={board} size={60} />
                        </div>
                        <span>{board.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {board.width}x{board.height}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs ${board.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {board.is_active ? 'Actif' : 'Terminé'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {new Date(board.end_time).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <button
                        onClick={() => handleEdit(board)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(board.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showForm && (
        <PixelBoardForm
          board={editingBoard}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default PixelBoardManagement;
