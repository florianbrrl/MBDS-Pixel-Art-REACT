import React, { useState } from 'react';
import { PixelBoard } from '@/types';
import PixelBoardCanvas from './PixelBoardCanvas';
import PixelBoardInfo from './PixelBoardInfo';
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

  const handlePixelClick = (x: number, y: number) => {
    if (readOnly || !onPixelPlaced) return;
    onPixelPlaced(x, y, selectedColor);
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

      <div className={`display-container ${infoVisible ? 'with-info' : 'without-info'}`}>
        {infoVisible && (
          <div className="info-panel">
            <PixelBoardInfo board={board} />
          </div>
        )}
        <div className="canvas-panel">
          <PixelBoardCanvas
            board={board}
            readOnly={readOnly}
            onPixelClick={handlePixelClick}
            selectedColor={selectedColor}
          />
        </div>
      </div>
    </div>
  );
};

export default PixelBoardDisplay;
