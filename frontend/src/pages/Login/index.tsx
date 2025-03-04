import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'URL de redirection si elle existe
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Rediriger vers la page précédente ou la page d'accueil
      navigate(from, { replace: true });
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
    }
  };

  return (
    <div className="login-page">
      <h1>Connexion</h1>

      {error && <div className="error-message">{error}</div>}

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

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <p className="auth-link">
        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
      </p>
    </div>
  );
};

export default Login;
