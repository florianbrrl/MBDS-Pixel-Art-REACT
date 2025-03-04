import React from 'react';

const Admin: React.FC = () => {
  return (
    <div className="admin-page">
      <h1>Administration</h1>
      <p>Panneau d'administration des PixelBoards</p>

      <div className="admin-actions">
        <button className="btn-primary">Créer un nouveau PixelBoard</button>
      </div>

      <div className="admin-boards-list">
        <h2>Gérer les PixelBoards</h2>
        <p>Chargement des PixelBoards...</p>
      </div>
    </div>
  );
};

export default Admin;
