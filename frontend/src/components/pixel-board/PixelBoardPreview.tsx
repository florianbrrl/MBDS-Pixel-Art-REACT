import React from 'react';
import { PixelBoard } from '@/types';
import '../../styles/PixelBoardPreview.css';

interface PixelBoardPreviewProps {
  board: PixelBoard;
  size?: number; // Taille optionnelle en pixels
}

const PixelBoardPreview: React.FC<PixelBoardPreviewProps> = ({ board, size = 150 }) => {
  // Calculer la taille de chaque pixel
  const pixelSize = Math.min(
    Math.floor(size / board.width),
    Math.floor(size / board.height)
  );

  // Calculer les dimensions réelles de la prévisualisation
  const previewWidth = pixelSize * board.width;
  const previewHeight = pixelSize * board.height;

  // Créer la grille de pixels
  const renderGrid = () => {
    const grid = [];

    // Pour chaque ligne
    for (let y = 0; y < board.height; y++) {
      const row = [];

      // Pour chaque colonne dans cette ligne
      for (let x = 0; x < board.width; x++) {
        const key = `${x},${y}`;
        const color = board.grid[key] || '#FFFFFF'; // Blanc par défaut

        row.push(
          <div
            key={key}
            className="preview-pixel"
            style={{
              width: `${pixelSize}px`,
              height: `${pixelSize}px`,
              backgroundColor: color,
            }}
          />
        );
      }

      grid.push(
        <div key={`row-${y}`} className="preview-row" style={{ display: 'flex' }}>
          {row}
        </div>
      );
    }

    return grid;
  };

  return (
    <div
      className="pixelboard-preview-container"
      style={{
        width: `${previewWidth}px`,
        height: `${previewHeight}px`
      }}
    >
      <div
        className={`pixelboard-preview ${board.width > 50 || board.height > 50 ? 'large-grid' : ''}`}
      >
        {renderGrid()}
      </div>
    </div>
  );
};

export default PixelBoardPreview;
