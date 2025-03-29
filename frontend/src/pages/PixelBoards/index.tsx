import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import { PixelBoard } from '@/types';
import PixelBoardList from '@/components/pixel-board/PixelBoardList';
import { useAuth } from '@/contexts/AuthContext';
import '../../styles/pixelboard.css';

const PixelBoards: React.FC = () => {
  // États pour les données
  const [boards, setBoards] = useState<PixelBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État d'authentification
  const { isAuthenticated } = useAuth();

  // Charger les PixelBoards
  useEffect(() => {
    loadBoards();
  }, []);

  // Fonction pour charger les PixelBoards
  const loadBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      // Utiliser les fonctions publiques ou authentifiées selon le statut de l'utilisateur
      const response = isAuthenticated
        ? await ApiService.getAllPixelBoards()
        : await ApiService.getPublic('/pixelboards');

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
