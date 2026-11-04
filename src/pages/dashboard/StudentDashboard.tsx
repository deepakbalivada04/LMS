import React from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_PROJECTS } from '../../lib/mockData';
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
  ArrowRight
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getCourseProgress } = useProgress();

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Student';

  // Featured Project Kit: ESP32 Rover
  const activeProject = SAMPLE_PROJECTS[0];
  const activeProgress = getCourseProgress(activeProject.courseId);

  // Compute live progress stats
  const totalProjects = SAMPLE_PROJECTS.length;
  const completedProjects = SAMPLE_PROJECTS.filter((p) => getCourseProgress(p.courseId).completionPercentage >= 100).length;
  const totalStagesCompleted = SAMPLE_PROJECTS.reduce(
    (acc, p) => acc + getCourseProgress(p.courseId).completedModules.length,
    0
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-2">
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
              Resume Active Project ({activeProgress.completionPercentage}%)
            </Link>

            <Link
              to={`/course/${activeProject.courseId}/exam`}
              className="py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs inline-flex items-center gap-2 border border-white/20 backdrop-blur-md transition"
            >
              <Award className="w-4 h-4 text-amber-300" />
              Project Certification
            </Link>
          </div>
        </div>

        {/* Live Project Card Widget */}
        <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-white min-w-[240px] shrink-0 relative z-10">
          <div className="flex items-center justify-between text-[11px] text-emerald-100 uppercase tracking-wider font-bold mb-1">
            <span>Current Project Kit</span>
            <span className="text-amber-300">Live Lab</span>
          </div>

          <span className="text-sm font-bold block leading-snug">
            {activeProject.title}
          </span>
          <span className="text-[11px] text-emerald-100 block mt-1">
            Stage 1: Chassis Assembly & Dual PWM
          </span>

          <div className="mt-4 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span>Build Progress</span>
              <span>{activeProgress.completionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${activeProgress.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STUDENT STATS                                          */}
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
            <span className="text-2xl font-extrabold text-slate-800">{totalStagesCompleted} Video Stages</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Hardware Certified</span>
            <span className="text-2xl font-extrabold text-slate-800">{completedProjects} Issued</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. HARDWARE PROJECT KITS (CLEAN VECTOR CARDS)             */}
      {/* ========================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Hardware Project Kits
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a project kit below to launch the split-screen video workbench, wiring schematics, and firmware files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_PROJECTS.map((project) => {
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
                      {project.modules.reduce((a, b) => a + b.durationMinutes, 0)} mins
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug group-hover:underline decoration-white/50">
                    {project.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Hardware BOM Callout */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div className="text-xs min-w-0">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Included Hardware Kit
                        </span>
                        <span className="text-slate-800 font-semibold block leading-tight mt-0.5 truncate">
                          {project.hardwareKit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Milestone Count */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-400">Kit Progress</span>
                      <span className="text-slate-800">{progress.completionPercentage}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-[#0ea5e9]'
                        }`}
                        style={{ width: `${progress.completionPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{completedCount} of {totalModules} build stages</span>
                      {isCompleted && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Exam
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <Link
                        to={`/course/${project.courseId}`}
                        className="py-2.5 px-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {progress.completionPercentage > 0 ? 'Resume Lab' : 'Build Kit'}
                      </Link>

                      <Link
                        to={`/course/${project.courseId}/exam`}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                          isCompleted
                            ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {isCompleted ? 'Take Exam' : 'Exam'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. WORKBENCH WIRING SAFETY CHECKLIST                      */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Hardware Test Bench</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            Physical Kit Wiring & Safety Standards
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Every project kit uses standard 3.3V logic protection, flyback diode motor isolation, and shared common ground wiring. Inspect the interactive schematics tab in each project before plugging in your LiPo battery.
          </p>
        </div>

        <Link
          to={`/course/${activeProject.courseId}`}
          className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-2 transition shrink-0"
        >
          <span>Open Schematics Viewer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
