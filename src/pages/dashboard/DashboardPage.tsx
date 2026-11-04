import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { AdminDashboard } from '../admin/AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { isAdmin, adminViewMode } = useAuth();

  if (isAdmin && adminViewMode === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};
