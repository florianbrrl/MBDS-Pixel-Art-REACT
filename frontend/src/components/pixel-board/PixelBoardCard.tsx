import React from 'react';
import { Link } from 'react-router-dom';
import { PixelBoard } from '@/types';
import PixelBoardPreview from './PixelBoardPreview';
import '../../styles/PixelBoardCard.css';

interface PixelBoardCardProps {
  board: PixelBoard;
}

const PixelBoardCard: React.FC<PixelBoardCardProps> = ({ board }) => {
  // Formater la date à afficher
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculer le temps restant
  const getTimeRemaining = (endTime: string): string => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance < 0) return 'Terminé';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    } else {
      return `${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
    }
  };

  // Calculer le pourcentage de remplissage
  const calculateFillPercentage = (): number => {
    const totalCells = board.width * board.height;
    const filledCells = Object.keys(board.grid).length;
    return Math.round((filledCells / totalCells) * 100);
  };

  return (
    <div className="pixelboard-card">
      <div className="card-header">
        <h3 className="board-title">{board.title}</h3>
        <span className={`status-badge ${board.is_active ? 'active' : 'completed'}`}>
          {board.is_active ? 'Actif' : 'Terminé'}
        </span>
      </div>

      <div className="preview-container">
        <PixelBoardPreview board={board} />
      </div>

      <div className="board-meta">
        <div className="meta-item">
          <span className="meta-label">Dimensions:</span>
          <span className="meta-value">{board.width}×{board.height}</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Délai:</span>
          <span className="meta-value">{board.cooldown}s</span>
        </div>

        {board.is_active && (
          <div className="meta-item">
            <span className="meta-label">Temps restant:</span>
            <span className="meta-value">{getTimeRemaining(board.end_time)}</span>
          </div>
        )}

        <div className="meta-item">
          <span className="meta-label">Date de fin:</span>
          <span className="meta-value">{formatDate(board.end_time)}</span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Progression:</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${calculateFillPercentage()}%` }}
            ></div>
            <span className="progress-text">{calculateFillPercentage()}%</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Link to={`/pixel-boards/${board.id}`} className="view-button">
          {board.is_active ? 'Participer' : 'Voir en détail'}
        </Link>
      </div>
    </div>
  );
};

export default PixelBoardCard;
