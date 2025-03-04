import React from 'react';
import { Link } from 'react-router-dom';
import { PixelBoard } from '@/types';

interface PixelBoardPreviewProps {
  board: PixelBoard;
  className?: string;
}

const PixelBoardPreview: React.FC<PixelBoardPreviewProps> = ({ board, className = '' }) => {
  const previewSize = 120; // Taille fixe pour la prévisualisation
  const pixelSize = Math.min(previewSize / board.width, previewSize / board.height);

  // Formater la date de fin
  const formatEndDate = (dateString: string): string => {
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

  return (
    <div className={`pixel-board-preview ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{board.title}</h3>
      <div
        className="board-preview-grid mb-2"
        style={{
          width: `${board.width * pixelSize}px`,
          height: `${board.height * pixelSize}px`,
          display: 'grid',
          gridTemplateColumns: `repeat(${board.width}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${board.height}, ${pixelSize}px)`,
          backgroundColor: 'var(--grid-bg)',
          border: '1px solid var(--grid-lines)',
        }}
      >
        {Object.entries(board.grid).map(([coord, color]) => {
          const [x, y] = coord.split(',').map(Number);
          return (
            <div
              key={coord}
              style={{
                gridColumn: x + 1,
                gridRow: y + 1,
                backgroundColor: color,
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
              }}
            />
          );
        })}
      </div>

      <div className="board-meta text-sm space-y-1">
        <div className="flex items-center space-x-2">
          <span className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {board.width}x{board.height}
          </span>
          <span
            className={`inline-block px-2 py-1 rounded ${
              board.is_active
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            {board.is_active ? 'Actif' : 'Terminé'}
          </span>
        </div>

        {board.is_active && (
          <div className="text-gray-600 dark:text-gray-400">{getTimeRemaining(board.end_time)}</div>
        )}

        <div className="text-gray-600 dark:text-gray-400">
          {board.is_active ? 'Fin le ' : 'Terminé le '} {formatEndDate(board.end_time)}
        </div>
      </div>

      <Link
        to={`/pixel-boards/${board.id}`}
        className="block mt-3 text-blue-600 dark:text-blue-400 hover:underline"
      >
        {board.is_active ? 'Participer' : 'Voir en détail'}
      </Link>
    </div>
  );
};

export default PixelBoardPreview;
