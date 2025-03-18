import React from 'react';
import { Link } from 'react-router-dom';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  isAdmin: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onLogout,
  isAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      <div className="mobile-nav-overlay" onClick={onClose} aria-hidden="true"></div>

      <nav className="mobile-nav">
        <ul className="mobile-nav-list">
          <li className="mobile-nav-item">
            <Link to="/" className="mobile-nav-link" onClick={onClose}>
              Accueil
            </Link>
          </li>
          <li className="mobile-nav-item">
            <Link to="/pixel-boards" className="mobile-nav-link" onClick={onClose}>
              Pixel Boards
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="mobile-nav-item">
                <Link to="/profile" className="mobile-nav-link" onClick={onClose}>
                  Profil
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/contributions" className="mobile-nav-link" onClick={onClose}>
                  Mes Contributions
                </Link>
              </li>
              {isAdmin && (
                <li className="mobile-nav-item">
                  <Link to="/admin" className="mobile-nav-link" onClick={onClose}>
                    Administration
                  </Link>
                </li>
              )}
              <li className="mobile-nav-item">
                <button onClick={onLogout} className="mobile-nav-button">
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="mobile-nav-item">
                <Link to="/login" className="mobile-nav-link" onClick={onClose}>
                  Connexion
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link to="/register" className="mobile-nav-link" onClick={onClose}>
                  Inscription
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
};

export default MobileNavigation;
