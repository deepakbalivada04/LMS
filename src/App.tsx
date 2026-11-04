import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CourseViewPage } from './pages/course/CourseViewPage';
import { ExamViewPage } from './pages/exam/ExamViewPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root Redirect to Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Authenticated Application Routes wrapped in Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Dedicated Admin Console Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/course/:courseId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CourseViewPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/course/:courseId/exam"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ExamViewPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  );
};

export default App;
