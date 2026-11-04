import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { HardwareProject } from '../../types/course';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Award, 
  Sparkles, 
  Wrench, 
  Boxes, 
  Layers, 
  Radio,
  ArrowRight,
  Shield,
  AlertCircle,
  Lock
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, role, isAdmin, toggleAdminViewMode } = useAuth();
  const { getCourseProgress } = useProgress();

  const [projects, setProjects] = useState<HardwareProject[]>([]);

  useEffect(() => {
    setProjects(projectService.getAllProjects());
  }, []);

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Member';

  // Featured Project Kit: First project in registry
  const activeProject = projects[0] || {
    projectId: 'crs-esp32-rover',
    courseId: 'crs-esp32-rover',
    title: 'Project 1: Autonomous Obstacle-Avoiding Rover Kit',
    category: 'Autonomous Vehicles',
    accentColor: '#0ea5e9',
    modules: [],
  };

  const activeProgress = getCourseProgress(activeProject.courseId);

  // Compute live progress stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => getCourseProgress(p.courseId).completionPercentage >= 100).length;
  const totalStagesCompleted = projects.reduce(
    (acc, p) => acc + getCourseProgress(p.courseId).completedModules.length,
    0
  );

  const isGuest = role === 'guest';

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Admin Preview Mode Notice */}
      {isAdmin && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">
              <strong className="text-white">Admin Workbench Preview:</strong> You are viewing the live student learning interface.
            </span>
          </div>
          <Link
            to="/admin"
            className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Return to Admin Console</span>
          </Link>
        </div>
      )}

      {/* Guest Preview Notice */}
      {isGuest && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-amber-900">
                Guest Preview Mode &mdash; Awaiting Enrollment Approval
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Welcome to the Robotics LMS! You can preview Stage 1 build videos and BOM component checklists. To unlock deeper stages, interactive pin schematics, code downloads, and exams, the Admin will approve your account.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-200/60 text-amber-900 font-bold text-xs shrink-0 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Pending Admin Approval</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HERO BANNER: ACTIVE ROBOTICS PROJECT SPOTLIGHT         */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-[#2bb398] via-[#24a58b] to-[#1e967d] rounded-3xl p-8 sm:p-10 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Radio className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span>Hardware Project Workbench Online</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-2">
            Build Real Robotics Projects with Hardware Kits
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
            Welcome back, <span className="text-white font-bold">{studentFirstName}</span>. Step-by-step video instructions, live wiring schematics, and embedded C++/Python code to program your physical microcontroller kits.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              to={`/course/${activeProject.courseId}`}
              className="py-3 px-6 rounded-2xl bg-white text-emerald-900 font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:bg-emerald-50 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current text-emerald-700" />
              <span>{isGuest ? 'Preview Project 1 Lab' : `Resume Active Project (${activeProgress.completionPercentage}%)`}</span>
            </Link>

            {!isGuest && (
              <Link
                to={`/course/${activeProject.courseId}/exam`}
                className="py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs inline-flex items-center gap-2 border border-white/20 backdrop-blur-md transition"
              >
                <Award className="w-4 h-4 text-amber-300" />
                Project Certification
              </Link>
            )}
          </div>
        </div>

        {/* Live Project Card Widget */}
        <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-white min-w-[240px] shrink-0 relative z-10">
          <div className="flex items-center justify-between text-[11px] text-emerald-100 uppercase tracking-wider font-bold mb-1">
            <span>Featured Kit</span>
            <span className="text-amber-300">{isGuest ? 'Preview Lab' : 'Active Lab'}</span>
          </div>

          <span className="text-sm font-bold block leading-snug">
            {activeProject.title}
          </span>
          <span className="text-[11px] text-emerald-100 block mt-1">
            Stage 1: Assembly & Motor Driver PWM
          </span>

          <div className="mt-4 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span>Build Progress</span>
              <span>{isGuest ? 'Preview' : `${activeProgress.completionPercentage}%`}</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: isGuest ? '15%' : `${activeProgress.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STATS ROW                                              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Project Kits Available</span>
            <span className="text-2xl font-extrabold text-slate-800">{totalProjects} Kits</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Build Stages Finished</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {isGuest ? 'Previewing' : `${totalStagesCompleted} Video Stages`}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Hardware Certified</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {isGuest ? 'Enrolled Students' : `${completedProjects} Issued`}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. HARDWARE PROJECT KITS                                  */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Hardware Project Kits
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a project kit below to launch the video workbench, wiring schematics, and firmware files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = getCourseProgress(project.courseId);
            const totalModules = project.modules.length;
            const completedCount = progress.completedModules.length;
            const isCompleted = progress.completionPercentage >= 100;

            return (
              <div
                key={project.projectId}
                className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-100 flex flex-col justify-between hover:border-slate-200 hover:shadow-md transition duration-200 group"
              >
                {/* Visual Project Header Banner */}
                <div 
                  className="p-6 text-white relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${project.accentColor} 0%, #0f172a 100%)`
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-white/20 backdrop-blur-md">
                      {project.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-black/30 backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.modules.reduce((a, b) => a + (b.durationMinutes || 20), 0)} mins
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold tracking-tight leading-snug line-clamp-2 mb-2 group-hover:text-emerald-200 transition">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Cpu className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="text-[11px] truncate">{project.hardwareKit}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6">
                    {project.description}
                  </p>

                  <div className="space-y-4">
                    {/* Stage Count & Completion Pill */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-sky-500" />
                        {totalModules} Step-by-Step Stages
                      </span>
                      {isGuest ? (
                        <span className="text-amber-600 font-semibold text-[11px]">Preview Enabled</span>
                      ) : isCompleted ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold font-mono text-[11px]">
                          {completedCount} / {totalModules} Done
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: isGuest ? '15%' : `${progress.completionPercentage}%`,
                          backgroundColor: project.accentColor,
                        }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        to={`/course/${project.projectId}`}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition group-hover:bg-[#0ea5e9]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isGuest ? 'Preview Stage 1' : 'Open Lab'}</span>
                      </Link>

                      {!isGuest && (
                        <Link
                          to={`/course/${project.projectId}/exam`}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 border border-slate-200 transition"
                          title="Hardware Kit Certification Exam"
                        >
                          <Award className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
