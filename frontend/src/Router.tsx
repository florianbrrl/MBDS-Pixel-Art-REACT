import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Route Protection Components
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PixelBoards from './pages/PixelBoards';
import PixelBoardDetail from './pages/PixelBoardDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Toutes les routes utilisent MainLayout */}
          <Route element={<MainLayout />}>
            {/* Routes publiques */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/pixel-boards" element={<PixelBoards />} />
              <Route path="/pixel-boards/:id" element={<PixelBoardDetail />} />
              <Route path="/access-denied" element={<AccessDenied />} />
            </Route>

            {/* Routes d'authentification */}
            <Route element={<PublicRoute restricted />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Routes protégées par l'authentification */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Routes protégées pour les administrateurs */}
            <Route element={<PrivateRoute requiredRoles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Routes de fallback */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
