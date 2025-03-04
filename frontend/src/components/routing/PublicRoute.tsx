import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ restricted = false }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Attendre que la vérification d'authentification soit terminée
  if (isLoading) {
    return <div>Chargement...</div>;
  }

  // Rediriger vers la page d'accueil si déjà authentifié et route restreinte
  if (isAuthenticated && restricted) {
    return <Navigate to="/" replace />;
  }

  // Afficher le contenu public
  return <Outlet />;
};

export default PublicRoute;
