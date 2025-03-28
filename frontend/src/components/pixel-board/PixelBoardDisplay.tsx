import React, { useState } from 'react';
import { PixelBoard } from '@/types';
import PixelBoardCanvas from './PixelBoardCanvas';
import PixelBoardInfo from './PixelBoardInfo';
import ColorPicker from './ColorPicker';
import './../../styles/PixelBoardDisplay.css';

interface PixelBoardDisplayProps {
  board: PixelBoard;
  readOnly?: boolean;
  onPixelPlaced?: (x: number, y: number, color: string) => void;
  selectedColor?: string;
  canEdit?: boolean;
}

const PixelBoardDisplay: React.FC<PixelBoardDisplayProps> = ({
  board,
  readOnly = false,
  onPixelPlaced,
  selectedColor = '#000000',
  canEdit = false,
}) => {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [notification, setNotification] = useState<string | null>(null);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handlePixelClick = (x: number, y: number) => {
    if (readOnly || !onPixelPlaced) return;

    // Vérifier si on peut écraser le pixel
    const pixelKey = `${x},${y}`;
    if (board.grid[pixelKey] && !board.allow_overwrite) {
      setNotification('Ce pixel ne peut pas être modifié');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Appeler la fonction parente sans afficher directement une notification
    // La notification de succès sera conditionnelle au niveau parent
    onPixelPlaced(x, y, currentColor);
  };

  return (
    <div className="pixel-board-display">

      {notification && <div className="pixel-notification">{notification}</div>}

      <div className="display-container with-info">
        <div className="info-panel">
          <PixelBoardInfo board={board} />

          {canEdit && !readOnly && (
            <ColorPicker selectedColor={currentColor} onColorSelect={handleColorChange} />
          )}
        </div>
        <div className="canvas-panel">
          <PixelBoardCanvas
            board={board}
            readOnly={readOnly}
            onPixelClick={handlePixelClick}
            selectedColor={currentColor}
          />
        </div>
      </div>
    </div>
  );
};

export default PixelBoardDisplay;
