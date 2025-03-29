import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import PixelBoardList from '@/components/pixel-board/PixelBoardList';
// Auth context would be needed if we used authentication checks
// import { useAuth } from '@/contexts/AuthContext';
import '../../styles/pixelboard.css';

const PixelBoards: React.FC = () => {
  // États pour les données
  const [boards, setBoards] = useState<PixelBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication state might be needed later
  // const { isAuthenticated } = useAuth();
  // Verify admin status if needed later
  // const isAdmin = isAuthenticated && hasRole(['admin']);

  // Charger les PixelBoards
  useEffect(() => {
    loadBoards();
  }, []);

  // Fonction pour charger les PixelBoards
  const loadBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      // Charger tous les PixelBoards
      const response = await ApiService.getAllPixelBoards();

      if (response.error) {
        setError(response.error);
      } else {
        setBoards(response.data || []);
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors du chargement des PixelBoards');
    }

    setLoading(false);
  };

  return (
    <div className="pixelboards-page">
      <div className="page-header">
        <h1 className="page-title">Tableaux Pixel Art</h1>
        <p className="page-description">
          Explorez et participez aux différents tableaux d'art pixel créés par la communauté
        </p>
      </div>

      <PixelBoardList
        boards={boards}
        loading={loading}
        error={error}
        onRefresh={loadBoards}
      />
    </div>
  );
};

export default PixelBoards;
