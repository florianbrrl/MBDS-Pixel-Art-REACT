import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Route Protection Components
import PrivateRoute from './components/routing/PrivateRoute';
import PublicRoute from './components/routing/PublicRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages pour réduire le bundle initial
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PixelBoards = lazy(() => import('./pages/PixelBoards'));
const PixelBoardDetail = lazy(() => import('./pages/PixelBoardDetail'));
const PixelBoardHeatmapPage = lazy(() => import('./pages/PixelBoardHeatmapPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const UserContributions = lazy(() => import('./pages/UserContributions'));
const SuperPixelBoard = lazy(() => import('./pages/SuperPixelBoard'));

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Toutes les routes utilisent MainLayout */}
          <Route element={<MainLayout />}>
            {/* Routes publiques */}
            <Route element={<PublicRoute />}>
              <Route path="/" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Home />
                </Suspense>
              } />
              <Route path="/pixel-boards" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PixelBoards />
                </Suspense>
              } />
              <Route path="/pixel-boards/:id" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PixelBoardDetail />
                </Suspense>
              } />
              <Route path="/pixel-boards/:id/heatmap" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PixelBoardHeatmapPage />
                </Suspense>
              } />
              <Route path="/super-board" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SuperPixelBoard />
                </Suspense>
              } />
              <Route path="/access-denied" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AccessDenied />
                </Suspense>
              } />
            </Route>

            {/* Routes d'authentification */}
            <Route element={<PublicRoute restricted />}>
              <Route path="/login" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/register" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Register />
                </Suspense>
              } />
            </Route>

            {/* Routes protégées par l'authentification */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="/contributions" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <UserContributions />
                </Suspense>
              } />
            </Route>

            {/* Routes protégées pour les administrateurs */}
            <Route element={<PrivateRoute requiredRoles={['admin']} />}>
              <Route path="/admin" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Admin />
                </Suspense>
              } />
            </Route>

            {/* Routes de fallback */}
            <Route path="/404" element={
              <Suspense fallback={<LoadingSpinner />}>
                <NotFound />
              </Suspense>
            } />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
