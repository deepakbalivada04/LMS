import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { AdminDashboard } from './AdminDashboard';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  if (role === 'admin' || role === 'teacher') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

