import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface PrivateRouteProps {
  requiredRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, currentUser, hasRole } = useAuth();
  const location = useLocation();

  // Attendre que la vérification d'authentification soit terminée
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner message="Vérification de l'authentification..." />
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles requis
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // Rediriger vers une page d'accès refusé ou la page d'accueil
    return <Navigate to="/access-denied" replace />;
  }

  // Afficher le contenu protégé
  return <Outlet />;
};

export default PrivateRoute;
