import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ApiService from '@/services/api.service';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation du formulaire
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setIsSubmitting(true);

      // Appel API (mock) pour enregistrer l'utilisateur
      const response = await ApiService.register(email, password);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Utiliser notre hook d'authentification pour se connecter
      await register(email, password);

      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (err) {
      setError("Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Inscription</h1>

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

        <div className="mb-4">
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
            minLength={6}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block mb-2 font-medium">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            <LoadingSpinner size="small" message="Inscription en cours..." />
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>

      <p className="mt-4 text-center">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export default Register;
