import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import '../../styles/access-denied.css';

const AccessDenied: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="access-denied-page">
      <h1>Accès Refusé</h1>
      <div className="error-banner">
        <p>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>

      <p className="user-info">
        {currentUser ? (
          <>
            Vous êtes connecté en tant que <strong>{currentUser.email}</strong> avec le rôle{' '}
            <strong>{currentUser.role || 'utilisateur'}</strong>.
          </>
        ) : (
          'Vous n\'êtes pas connecté.'
        )}
      </p>

      <div className="actions">
        <Link to="/" className="primary-button">
          Retour à l'accueil
        </Link>
        {currentUser?.role !== 'admin' && (
          <p className="contact-info">
            Contactez un administrateur si vous pensez que vous devriez avoir accès à cette page.
          </p>
        )}
      </div>
    </div>
  );
};

export default AccessDenied;
