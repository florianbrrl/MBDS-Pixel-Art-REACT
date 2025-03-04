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
    <div className="auth-page">
      <h1 className="text-3xl font-bold mb-6">Connexion</h1>

      {error && (
        <div className="error-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: '20px', height: '20px', flexShrink: 0 }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="loading-button">
              <span className="loading-spinner"></span>
              Connexion en cours...
            </span>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="auth-link">
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;
