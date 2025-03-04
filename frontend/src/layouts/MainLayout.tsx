import React from 'react';
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <Link to="/" className="header-link">
            PixelArt App
          </Link>
        </h1>
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Accueil</Link>
            </li>
            <li className="nav-item">
              <Link to="/pixel-boards" className="nav-link">Pixel Boards</Link>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">Profil</Link>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="nav-button">Déconnexion</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Connexion</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Inscription</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        <ThemeToggle className="theme-toggle-button" />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>© 2025 PixelArt App</p>
      </footer>
    </div>
  );
};

export default MainLayout;
