import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Bienvenue sur PixelArt App</h1>
      <p>Créez et partagez des pixel arts avec la communauté !</p>

      <section className="home-stats">
        <h2>Statistiques</h2>
        <div className="stats-container">
          <div className="stat-item">
            <h3>Utilisateurs</h3>
            <p className="stat-number">--</p>
          </div>
          <div className="stat-item">
            <h3>PixelBoards</h3>
            <p className="stat-number">--</p>
          </div>
        </div>
      </section>

      <section className="featured-boards">
        <h2>PixelBoards en cours</h2>
        <div className="boards-grid">
          <p>Chargement des PixelBoards...</p>
        </div>
      </section>

      <section className="completed-boards">
        <h2>PixelBoards terminés</h2>
        <div className="boards-grid">
          <p>Chargement des PixelBoards...</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
