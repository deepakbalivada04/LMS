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
  Sparkles,
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
      setShowToast(`Lesson "${activeModule.title}" marked as complete!`);

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
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-indigo-500 text-white text-xs font-semibold flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce">
          <CheckCheck className="w-5 h-5 text-indigo-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* TOP STANDARD LMS HEADER BAR (Udemy / Coursera Style) */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-16 z-40">
        {/* Left: Course Title & Back button */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="truncate">
            <h1 className="text-sm font-bold text-white truncate leading-tight">
              {course.title}
            </h1>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Lesson {activeModuleIndex + 1} of {course.modules.length}
            </span>
          </div>
        </div>

        {/* Right: Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Progress display */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Your Progress</span>
              <span className="text-xs font-bold text-white">
                {progress.completionPercentage}% Complete
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Exam Shortcut if finished */}
          {isAllModulesCompleted && (
            <button
              onClick={() => navigate(`/course/${course.courseId}/exam`)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Award className="w-3.5 h-3.5" />
              Take Exam
            </button>
          )}

          {/* Theater Mode / Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
            title={isSidebarOpen ? 'Collapse Course Content' : 'Expand Course Content'}
          >
            {isSidebarOpen ? (
              <>
                <PanelRightClose className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Hide Content</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Course Content</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT / CENTER VIEWPORT (VIDEO PLAYER & LAB SUBSYSTEM TABS) */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Video Container (Cinema/Player container) */}
          <div className="bg-black flex justify-center items-center w-full">
            <div className="w-full max-w-5xl aspect-video max-h-[70vh]">
              <HlsVideoPlayer
                key={activeModule.videoUrl}
                src={activeModule.videoUrl}
                title={activeModule.title}
                poster={course.thumbnailUrl}
                onEnded={() => {
                  if (!isCurrentModuleDone) {
                    handleMarkAsComplete();
                  }
                }}
              />
            </div>
          </div>

          {/* Lesson Action Bar: Prev / Next / Mark as Complete */}
          <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                <span>MODULE {activeModuleIndex + 1}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <Clock className="w-3.5 h-3.5" />
                  {activeModule.durationMinutes} mins
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {activeModule.title}
              </h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handlePrevModule}
                disabled={activeModuleIndex === 0}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="button"
                onClick={handleMarkAsComplete}
                disabled={isMarkingComplete}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                  isCurrentModuleDone
                    ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isCurrentModuleDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isSyncingWithAWS ? 'Syncing...' : 'Completed'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSyncingWithAWS ? 'Saving...' : 'Mark as Complete & Next'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNextModule}
                disabled={activeModuleIndex === course.modules.length - 1}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* LOWER LAB & LESSON TABS (Coursera / edX Style) */}
          <div className="p-6 max-w-5xl w-full mx-auto flex-1">
            {/* Standard Tab Navigation */}
            <div className="flex border-b border-slate-800 gap-6 text-sm font-medium mb-6">
              <button
                onClick={() => setActiveTab('hardware')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px ${
                  activeTab === 'hardware'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Hardware BOM ({activeModule.hardwareChecklist.length})
              </button>

              <button
                onClick={() => setActiveTab('wiring')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px ${
                  activeTab === 'wiring'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Wiring Schematics ({activeModule.wiringDiagrams.length})
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px ${
                  activeTab === 'code'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4" />
                Firmware & Code ({activeModule.codeSnippets.length})
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-px ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                Lesson Notes
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pb-12">
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-sm space-y-4">
                  <h3 className="text-base font-bold text-white">Lesson Summary & Objectives</h3>
                  <p className="leading-relaxed text-slate-400">{activeModule.description}</p>
                  
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block uppercase tracking-wider">
                      Hardware Learning Outcomes
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                      <li>Verify micro-controller GPIO routing and logic levels (3.3V vs 5V).</li>
                      <li>Safely wire dual H-Bridge PWM motor channels with common ground isolation.</li>
                      <li>Flash firmware and verify motor direction and ultrasound telemetry in real time.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLLAPSIBLE COURSE CURRICULUM SIDEBAR (UDEMY STYLE) */}
        {/* ========================================================= */}
        {isSidebarOpen && (
          <aside className="w-80 lg:w-96 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div>
                <h3 className="font-bold text-sm text-white">Course Content</h3>
                <span className="text-[11px] text-slate-400">
                  {progress.completedModules.length} / {course.modules.length} completed
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Hide sidebar"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Curriculum Modules List */}
            <div className="divide-y divide-slate-800/60 flex-1">
              {course.modules.map((mod, idx) => {
                const isDone = isModuleCompleted(course.courseId, mod.moduleId);
                const isActive = idx === activeModuleIndex;

                return (
                  <div
                    key={mod.moduleId}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`p-4 transition cursor-pointer select-none flex items-start gap-3 ${
                      isActive
                        ? 'bg-slate-800/80 border-l-4 border-indigo-500 pl-3'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Completion Status Checkbox */}
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </div>

                    {/* Lesson Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white leading-snug truncate">
                        {idx + 1}. {mod.title}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                          {mod.durationMinutes}m
                        </span>
                        <span>•</span>
                        <span>{mod.hardwareChecklist.length} parts</span>
                        <span>•</span>
                        <span>{mod.codeSnippets.length} files</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End of Course Exam Card in Sidebar */}
              <div
                onClick={() => {
                  if (isAllModulesCompleted) {
                    navigate(`/course/${course.courseId}/exam`);
                  }
                }}
                className={`p-4 transition flex items-start gap-3 ${
                  isAllModulesCompleted
                    ? 'hover:bg-amber-500/10 cursor-pointer border-t border-amber-500/30'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isAllModulesCompleted ? (
                    <Award className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Final Certification Exam
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isAllModulesCompleted
                      ? 'All lessons complete! Click to start exam.'
                      : 'Complete all lessons to unlock exam.'}
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
