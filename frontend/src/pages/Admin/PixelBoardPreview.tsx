import React from 'react';
import { PixelBoard } from '@/types';
import '@/styles/pixelboard.css';

interface PixelBoardPreviewProps {
  board: PixelBoard;
  size?: number; // Taille de la prévisualisation en pixels
}

const PixelBoardPreview: React.FC<PixelBoardPreviewProps> = ({ board, size = 100 }) => {
  // Calculer la taille d'une cellule en fonction des dimensions du board
  const cellSize = Math.min(Math.floor(size / board.width), Math.floor(size / board.height));

  // Créer un tableau 2D pour représenter la grille
  const grid = [];

  // Préparer la grille avec des cellules vides
  for (let y = 0; y < board.height; y++) {
    const row = [];
    for (let x = 0; x < board.width; x++) {
      const key = `${x},${y}`;
      const color = board.grid[key] || '#FFFFFF'; // Blanc par défaut
      row.push(
        <div
          key={key}
          style={{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            backgroundColor: color,
          }}
        />,
      );
    }
    grid.push(
      <div key={`row-${y}`} style={{ display: 'flex' }}>
        {row}
      </div>,
    );
  }

  return (
    <div
      className="pixel-board-preview"
      style={{
        width: `${Math.min(board.width * cellSize, size)}px`,
        height: `${Math.min(board.height * cellSize, size)}px`,
        border: '1px solid #ccc',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {grid}
    </div>
  );
};

export default PixelBoardPreview;
