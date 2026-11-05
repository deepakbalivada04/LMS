import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { ExamEngine } from '../../components/exam/ExamEngine';
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react';

export const ExamViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAdmin } = useAuth();
  const course = projectService.getProjectById(courseId || '');

  if (!course) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Track Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested course track was not found in the certification catalog.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isEnrolled = isAdmin || projectService.isUserEnrolledInProject(user, course);
  if (!isEnrolled) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Certification Exam Locked</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          You must be enrolled in <strong className="text-slate-700">{course.title}</strong> by an administrator to take this certification exam.
        </p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Enrolled Courses
        </Link>
      </div>
    );
  }

  return <ExamEngine course={course} />;
};
