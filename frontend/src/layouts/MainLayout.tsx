import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavigation from '@/components/navigation/MobileNavigation';

const MainLayout: React.FC = () => {
  const { isAuthenticated, logout, currentUser, hasRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Vérifier si l'utilisateur a le rôle d'administrateur
  const isAdmin = hasRole(['admin']);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <Link to="/" className="header-link" onClick={() => setMobileMenuOpen(false)}>
              PixelArt App
            </Link>
          </h1>

          {/* Bouton du menu mobile */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </span>
          </button>

          {/* Navigation desktop */}
          <nav className="main-nav desktop-nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Accueil
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/pixel-boards" className="nav-link">
                  Pixel Boards
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/super-board" className="nav-link">
                  SuperPixelBoard
                </Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="nav-item">
                    <Link to="/profile" className="nav-link">
                      Profil
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/contributions" className="nav-link">
                      Mes Contributions
                    </Link>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <Link to="/admin" className="nav-link">
                        Administration
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <button onClick={handleLogout} className="nav-button">
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">
                      Connexion
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link">
                      Inscription
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <ThemeToggle className="theme-toggle-button" />
        </div>

        {/* Menu mobile */}
        <MobileNavigation
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          isAdmin={isAdmin}
        />
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} PixelArt App</p>
          <div className="footer-links">
            <Link to="/" className="footer-link">
              Accueil
            </Link>
            <Link to="/pixel-boards" className="footer-link">
              Pixel Boards
            </Link>
            <Link to="/super-board" className="footer-link">
              Super Pixel Board
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="footer-link">
                Mon profil
              </Link>
            ) : (
              <Link to="/login" className="footer-link">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
