import React from 'react';
import { useParams } from 'react-router-dom';

const PixelBoardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="pixel-board-detail-page">
      <h1>PixelBoard #{id}</h1>
      <p>Détails et participation au PixelBoard</p>

      <div className="pixel-board-container">
        <p>Chargement du PixelBoard...</p>
      </div>
    </div>
  );
};

export default PixelBoardDetail;
