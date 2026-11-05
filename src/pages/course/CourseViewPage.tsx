import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { CoursePlayer } from '../../components/player/CoursePlayer';
import { ArrowLeft, AlertCircle, Lock, Mail, ShieldAlert } from 'lucide-react';

export const CourseViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, isAdmin } = useAuth();
  const course = projectService.getProjectById(courseId || '');

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Hardware Project Track Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          Project ID <span className="text-sky-500 font-mono font-bold">{courseId}</span> does not exist in the curriculum.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Commercial LMS Enrollment Verification
  const isEnrolled = isAdmin || projectService.isUserEnrolledInProject(user, course);

  if (!isEnrolled) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono uppercase font-bold text-amber-600 tracking-wider">
          Access Restricted &bull; Enrollment Required
        </span>

        <h2 className="text-xl font-extrabold text-slate-900 mt-2 mb-2">
          {course.title}
        </h2>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          You are not currently enrolled in this hardware course. In this LMS, content is unlocked only after an administrator approves your registration and allocates the curriculum to your student profile.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left mb-6 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Track Category:</span>
            <span className="font-bold text-slate-800">{course.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Hardware Kit:</span>
            <span className="font-mono text-[11px] text-slate-700 truncate max-w-[240px]">{course.hardwareKit}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-400">Your Status:</span>
            <span className="font-bold text-amber-600">Not Assigned</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Enrolled Courses</span>
          </Link>

          <a
            href="mailto:sannathkoushik@gmail.com?subject=Enrollment%20Request%20for%20Course%20Access"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Administrator</span>
          </a>
        </div>
      </div>
    );
  }

  return <CoursePlayer course={course} />;
};
