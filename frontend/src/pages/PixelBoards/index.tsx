import React from 'react';

const PixelBoards: React.FC = () => {
  return (
    <div className="pixel-boards-page">
      <h1>Tous les PixelBoards</h1>
      <p>Explorez les PixelBoards créés par la communauté</p>

      <div className="boards-grid">
        <p>Chargement des PixelBoards...</p>
      </div>
    </div>
  );
};

export default PixelBoards;
