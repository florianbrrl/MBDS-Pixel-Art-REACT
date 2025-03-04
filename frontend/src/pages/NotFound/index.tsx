import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Page Non Trouvée</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary">
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;
