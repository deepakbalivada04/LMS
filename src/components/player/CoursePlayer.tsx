import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Course, Module } from '../../types/course';
import { useProgress } from '../../context/ProgressContext';
import { HlsVideoPlayer } from './HlsVideoPlayer';
import { HardwareChecklistTab } from './HardwareChecklistTab';
import { WiringDiagramsTab } from './WiringDiagramsTab';
import { CodeSnippetsTab } from './CodeSnippetsTab';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Clock, 
  ArrowLeft,
  PanelRightClose,
  PanelRightOpen,
  Wrench,
  Layers,
  FileCode,
  FileText,
  PlayCircle,
  Lock,
  CheckCheck
} from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
}

type BottomTabType = 'hardware' | 'wiring' | 'code' | 'overview';

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course }) => {
  const navigate = useNavigate();
  const { markModuleComplete, isModuleCompleted, getCourseProgress, isSyncingWithAWS } = useProgress();

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<BottomTabType>('hardware');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const activeModule: Module = course.modules[activeModuleIndex] || course.modules[0];
  const progress = getCourseProgress(course.courseId);
  const isCurrentModuleDone = isModuleCompleted(course.courseId, activeModule.moduleId);
  const isAllModulesCompleted = course.modules.every((m) => isModuleCompleted(course.courseId, m.moduleId));

  const handleMarkAsComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await markModuleComplete(course.courseId, activeModule.moduleId);
      setShowToast(`Module "${activeModule.title}" completed!`);

      setTimeout(() => {
        setShowToast(null);
      }, 3500);

      // Auto-advance to next module if available
      if (activeModuleIndex < course.modules.length - 1) {
        setActiveModuleIndex(activeModuleIndex + 1);
      }
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleNextModule = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }
  };

  const handlePrevModule = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex(activeModuleIndex - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-[1600px] mx-auto w-full">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-sky-200 text-slate-800 text-xs font-bold flex items-center gap-3 shadow-xl animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
            <CheckCheck className="w-4 h-4" />
          </div>
          <span>{showToast}</span>
        </div>
      )}

      {/* TOP STUDENT TOOLBAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-slate-100 hidden sm:block" />
          <div className="truncate">
            <h1 className="text-sm font-extrabold text-slate-800 truncate">
              {course.title}
            </h1>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Project Stage {activeModuleIndex + 1} of {course.modules.length}
            </span>
          </div>
        </div>

        {/* Right: Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Progress display */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Progress</span>
              <span className="text-xs font-extrabold text-sky-600">
                {progress.completionPercentage}% Complete
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0ea5e9] rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Exam Shortcut if finished */}
          {isAllModulesCompleted && (
            <button
              onClick={() => navigate(`/course/${course.courseId}/exam`)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Award className="w-4 h-4" />
              Take Exam
            </button>
          )}

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition"
            title={isSidebarOpen ? 'Hide Course Syllabus' : 'Show Course Syllabus'}
          >
            {isSidebarOpen ? (
              <>
                <PanelRightClose className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Hide Syllabus</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 text-sky-500" />
                <span className="hidden sm:inline">View Syllabus</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT-VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT / CENTER VIEWPORT (VIDEO PLAYER & LAB SUBSYSTEM TABS) */}
        {/* ========================================================= */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          {/* Video Card */}
          <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-100">
            <HlsVideoPlayer
              key={activeModule.videoUrl}
              src={activeModule.videoUrl}
              title={activeModule.title}
              onEnded={() => {
                if (!isCurrentModuleDone) {
                  handleMarkAsComplete();
                }
              }}
            />
          </div>

          {/* Lesson Action Bar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-sky-500 font-bold mb-1">
                <span>MODULE {activeModuleIndex + 1}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {activeModule.durationMinutes} mins
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
                {activeModule.title}
              </h2>
            </div>

            {/* Actions: Prev / Complete / Next */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrevModule}
                disabled={activeModuleIndex === 0}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleMarkAsComplete}
                disabled={isMarkingComplete}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                  isCurrentModuleDone
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/20'
                }`}
              >
                {isCurrentModuleDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isSyncingWithAWS ? 'Syncing...' : 'Completed ✓'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSyncingWithAWS ? 'Saving to DynamoDB...' : 'Mark as Complete & Next'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNextModule}
                disabled={activeModuleIndex === course.modules.length - 1}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LOWER LAB TABS (Hardware / Wiring / Code / Overview) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-100 gap-6 text-xs sm:text-sm font-bold mb-6 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('hardware')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px shrink-0 ${
                  activeTab === 'hardware'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Hardware BOM ({activeModule.hardwareChecklist.length})
              </button>

              <button
                onClick={() => setActiveTab('wiring')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px shrink-0 ${
                  activeTab === 'wiring'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Wiring Schematics ({activeModule.wiringDiagrams.length})
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px shrink-0 ${
                  activeTab === 'code'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileCode className="w-4 h-4" />
                Firmware & Code ({activeModule.codeSnippets.length})
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px shrink-0 ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Lesson Notes
              </button>
            </div>

            {/* Tab Contents */}
            <div>
              {activeTab === 'hardware' && (
                <HardwareChecklistTab items={activeModule.hardwareChecklist} />
              )}
              {activeTab === 'wiring' && (
                <WiringDiagramsTab diagrams={activeModule.wiringDiagrams} />
              )}
              {activeTab === 'code' && (
                <CodeSnippetsTab snippets={activeModule.codeSnippets} />
              )}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                  <h3 className="font-bold text-slate-800 text-base">Lesson Overview</h3>
                  <p className="leading-relaxed text-slate-500">{activeModule.description}</p>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Hardware Objectives
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-500 space-y-1">
                      <li>Check ESP32 pinout voltage levels (protect GPIO with level shifting).</li>
                      <li>Tie common ground between high-current battery and logic rail.</li>
                      <li>Deploy motor PWM speed controls and test ultrasonic telemetry.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLLAPSIBLE COURSE SYLLABUS                         */}
        {/* ========================================================= */}
        {isSidebarOpen && (
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">Project Build Stages</h3>
                <span className="text-[11px] text-slate-400">
                  {progress.completedModules.length} of {course.modules.length} video stages completed
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold text-xs">
                {progress.completionPercentage}%
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {course.modules.map((mod, idx) => {
                const isDone = isModuleCompleted(course.courseId, mod.moduleId);
                const isActive = idx === activeModuleIndex;

                return (
                  <div
                    key={mod.moduleId}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`p-3.5 rounded-2xl transition cursor-pointer select-none flex items-start gap-3 border ${
                      isActive
                        ? 'bg-sky-50/70 border-sky-300 text-sky-950 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 leading-snug truncate">
                        {idx + 1}. {mod.title}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5 text-sky-500" />
                          {mod.durationMinutes}m
                        </span>
                        <span>•</span>
                        <span>{mod.hardwareChecklist.length} parts</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End of Course Exam Card */}
              <div
                onClick={() => {
                  if (isAllModulesCompleted) {
                    navigate(`/course/${course.courseId}/exam`);
                  }
                }}
                className={`p-4 rounded-2xl transition flex items-start gap-3 border ${
                  isAllModulesCompleted
                    ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-50 cursor-pointer shadow-xs'
                    : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isAllModulesCompleted ? (
                    <Award className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Final Certification Exam
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAllModulesCompleted
                      ? 'All lessons complete! Click to start exam.'
                      : 'Complete all lessons to unlock.'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
