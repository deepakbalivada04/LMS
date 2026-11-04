import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { SAMPLE_COURSES } from '../../lib/mockData';
import { CoursePlayer } from '../../components/player/CoursePlayer';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const CourseViewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = projectService.getProjectById(courseId || '') || SAMPLE_COURSES.find((c) => c.courseId === courseId);

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

  return <CoursePlayer course={course} />;
};
