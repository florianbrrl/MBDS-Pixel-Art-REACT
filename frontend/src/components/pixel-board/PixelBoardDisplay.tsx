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
  const [infoVisible, setInfoVisible] = useState(true);
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

    onPixelPlaced(x, y, currentColor);

    // Afficher une notification de succès
    setNotification(`Pixel placé en (${x}, ${y})`);
    setTimeout(() => setNotification(null), 2000);
  };

  const toggleInfo = () => {
    setInfoVisible(!infoVisible);
  };

  return (
    <div className="pixel-board-display">
      <div className="display-header">
        <h2>{board.title}</h2>
        <div className="display-controls">
          <button
            className="toggle-info-button"
            onClick={toggleInfo}
            title={infoVisible ? 'Masquer les informations' : 'Afficher les informations'}
          >
            {infoVisible ? 'Masquer infos' : 'Afficher infos'}
          </button>
        </div>
      </div>

      {notification && <div className="pixel-notification">{notification}</div>}

      <div className={`display-container ${infoVisible ? 'with-info' : 'without-info'}`}>
        {infoVisible && (
          <div className="info-panel">
            <PixelBoardInfo board={board} />

            {canEdit && !readOnly && (
              <ColorPicker selectedColor={currentColor} onColorSelect={handleColorChange} />
            )}
          </div>
        )}
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
