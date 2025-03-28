import React, { useState, useEffect } from 'react';
import ApiService from '@/services/api.service';
import '../../styles/connection-counter.css';

interface BoardConnectionCounterProps {
  boardId: string;
  className?: string;
}

/**
 * Composant affichant le nombre de personnes connectées sur un PixelBoard
 */
const BoardConnectionCounter: React.FC<BoardConnectionCounterProps> = ({ boardId, className = '' }) => {
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fonction pour récupérer le nombre de connexions
    const fetchConnectionCount = async () => {
      try {
        const response = await ApiService.get(`/pixelboards/${boardId}/connections`);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setConnectionCount(response.data.activeConnections || 0);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération des connexions');
      } finally {
        setLoading(false);
      }
    };

    // Récupérer les données initiales
    fetchConnectionCount();

    // Mettre à jour les données toutes les 10 secondes
    const intervalId = setInterval(fetchConnectionCount, 10000);

    // Nettoyer l'intervalle à la démonture du composant
    return () => clearInterval(intervalId);
  }, [boardId]);

  // Si en cours de chargement, ne rien afficher ou afficher un indicateur minimaliste
  if (loading) {
    return <span className={`connection-counter ${className}`}>...</span>;
  }

  // Si erreur, ne rien afficher ou simplement ignorer
  if (error) {
    return null;
  }

  return (
    <div className={`connection-counter ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="connection-icon"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.5"></path>
      </svg>
      <span className="connection-count">{connectionCount}</span>
      <span className="connection-label"> en ligne</span>
    </div>
  );
};

export default BoardConnectionCounter;
