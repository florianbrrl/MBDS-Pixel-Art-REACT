import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';

const AuthLayout: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <Link to="/" className="header-link">
            PixelArt App
          </Link>
        </h1>
        <ThemeToggle className="theme-toggle-button" />
      </header>
      <main className="app-main auth-layout">
        <div className="auth-container">
          <Outlet />
        </div>
      </main>
      <footer className="app-footer">
        <p>© 2025 PixelArt App</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
