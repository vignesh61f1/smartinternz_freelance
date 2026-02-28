import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import ClientDashboard from '../pages/client/ClientDashboard';
import PostProject from '../pages/client/PostProject';
import ClientProjectDetail from '../pages/client/ClientProjectDetail';

import FreelancerDashboard from '../pages/freelancer/FreelancerDashboard';
import BrowseProjects from '../pages/freelancer/BrowseProjects';
import FreelancerProjectDetail from '../pages/freelancer/FreelancerProjectDetail';
import MyBids from '../pages/freelancer/MyBids';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageProjects from '../pages/admin/ManageProjects';

import ProjectChat from '../pages/shared/ProjectChat';
import Profile from '../pages/shared/Profile';
import NotFound from '../pages/shared/NotFound';
import Unauthorized from '../pages/shared/Unauthorized';

const AppRoutes = () => {
  const { user } = useAuth();

  const getDashboardRedirect = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'client':
        return '/client/dashboard';
      case 'freelancer':
        return '/freelancer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDashboardRedirect()} replace />} />
      <Route path="/login" element={user ? <Navigate to={getDashboardRedirect()} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDashboardRedirect()} replace /> : <Register />} />

      {/* Client Routes */}
      <Route path="/client/dashboard" element={
        <ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>
      } />
      <Route path="/client/post-project" element={
        <ProtectedRoute roles={['client']}><PostProject /></ProtectedRoute>
      } />
      <Route path="/client/project/:id" element={
        <ProtectedRoute roles={['client']}><ClientProjectDetail /></ProtectedRoute>
      } />

      {/* Freelancer Routes */}
      <Route path="/freelancer/dashboard" element={
        <ProtectedRoute roles={['freelancer']}><FreelancerDashboard /></ProtectedRoute>
      } />
      <Route path="/freelancer/browse" element={
        <ProtectedRoute roles={['freelancer']}><BrowseProjects /></ProtectedRoute>
      } />
      <Route path="/freelancer/project/:id" element={
        <ProtectedRoute roles={['freelancer']}><FreelancerProjectDetail /></ProtectedRoute>
      } />
      <Route path="/freelancer/my-bids" element={
        <ProtectedRoute roles={['freelancer']}><MyBids /></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>
      } />
      <Route path="/admin/projects" element={
        <ProtectedRoute roles={['admin']}><ManageProjects /></ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/chat/:projectId" element={
        <ProtectedRoute roles={['client', 'freelancer']}><ProjectChat /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
