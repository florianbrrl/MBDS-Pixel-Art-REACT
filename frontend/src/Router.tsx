import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Route Protection Components
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';

// Pages
import Home from './pages/Home/index';
import Login from './pages/Login/index';
import Register from './pages/Register/index';
import PixelBoards from './pages/PixelBoards/index';
import PixelBoardDetail from './pages/PixelBoardDetail/index';
import Profile from './pages/Profile/index';
import Admin from './pages/Admin/index';
import NotFound from './pages/NotFound/index';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques avec MainLayout */}
          <Route element={<MainLayout />}>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/pixel-boards" element={<PixelBoards />} />
              <Route path="/pixel-boards/:id" element={<PixelBoardDetail />} />
            </Route>

            {/* Routes protégées avec MainLayout */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>

          {/* Routes d'authentification avec AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route element={<PublicRoute restricted />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Routes de fallback */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
