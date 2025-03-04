import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de redirection si elle existe
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);

      // Appel API (mock) pour se connecter
      const response = await ApiService.login(email, password);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Utiliser notre hook d'authentification
      await login(email, password);

      // Rediriger vers la page précédente ou la page d'accueil
      navigate(from, { replace: true });
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Connexion</h1>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 font-medium">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
        >
          {isSubmitting ? (
            <LoadingSpinner size="small" message="Connexion en cours..." />
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="mt-4 text-center">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
          S'inscrire
        </Link>
      </p>
    </div>
  );
};

export default Login;
