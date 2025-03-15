import React from 'react';
import { PixelBoard } from '@/types';
import './../../styles/PixelBoardInfo.css';

interface PixelBoardInfoProps {
  board: PixelBoard;
}

const PixelBoardInfo: React.FC<PixelBoardInfoProps> = ({ board }) => {
  // Formater la date à afficher
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculer le temps restant
  const getTimeRemaining = (): string => {
    const now = new Date();
    const endDate = new Date(board.end_time);

    if (now > endDate) {
      return 'Terminé';
    }

    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''} restant${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} heure${diffHours > 1 ? 's' : ''} restante${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} restante${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  // Calculer le pourcentage de remplissage du tableau
  const calculateCompletionPercentage = (): number => {
    const totalPixels = board.width * board.height;
    const filledPixels = Object.keys(board.grid).length;

    return Math.round((filledPixels / totalPixels) * 100);
  };

  return (
    <div className="pixel-board-info">
      <h2 className="pixel-board-title">{board.title}</h2>

      <div className="pixel-board-meta">
        <div className="pixel-board-meta-item">
          <span className="meta-label">Dimensions:</span>
          <span className="meta-value">
            {board.width} × {board.height}
          </span>
        </div>

        <div className="pixel-board-meta-item">
          <span className="meta-label">Délai:</span>
          <span className="meta-value">{board.cooldown} secondes</span>
        </div>

        <div className="pixel-board-meta-item">
          <span className="meta-label">Écrasement:</span>
          <span className="meta-value">{board.allow_overwrite ? 'Autorisé' : 'Non autorisé'}</span>
        </div>

        <div className="pixel-board-meta-item">
          <span className="meta-label">Statut:</span>
          <span className={`meta-value status-badge ${board.is_active ? 'active' : 'inactive'}`}>
            {board.is_active ? 'Actif' : 'Terminé'}
          </span>
        </div>

        {board.is_active && (
          <div className="pixel-board-meta-item">
            <span className="meta-label">Temps restant:</span>
            <span className="meta-value">{getTimeRemaining()}</span>
          </div>
        )}

        <div className="pixel-board-meta-item">
          <span className="meta-label">Début:</span>
          <span className="meta-value">{formatDate(board.start_time)}</span>
        </div>

        <div className="pixel-board-meta-item">
          <span className="meta-label">Fin:</span>
          <span className="meta-value">{formatDate(board.end_time)}</span>
        </div>

        <div className="pixel-board-meta-item">
          <span className="meta-label">Remplissage:</span>
          <div className="completion-bar">
            <div
              className="completion-progress"
              style={{ width: `${calculateCompletionPercentage()}%` }}
            ></div>
            <span className="completion-text">{calculateCompletionPercentage()}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixelBoardInfo;
