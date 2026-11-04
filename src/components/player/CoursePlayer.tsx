import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Course, Module } from '../../types/course';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
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
  CheckCheck,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
}

type BottomTabType = 'hardware' | 'wiring' | 'code' | 'overview';

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course }) => {
  const navigate = useNavigate();
  const { role, isAdmin } = useAuth();
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

  const isGuest = role === 'guest';
  const isStageLockedForGuest = isGuest && activeModuleIndex > 0;

  const handleMarkAsComplete = async () => {
    if (isGuest) {
      setShowToast('Preview Mode: Progress tracking activates once your account is approved as an enrolled student.');
      setTimeout(() => setShowToast(null), 3500);
      return;
    }

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

      {/* Guest Notice Banner if Guest */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Guest Preview Mode:</strong> Stage 1 and BOM component checklist are open for preview. Deeper build stages unlock upon Admin enrollment approval.
            </span>
          </div>
          <span className="px-2.5 py-1 bg-amber-200/60 font-bold rounded-lg text-[10px] uppercase">
            Awaiting Approval
          </span>
        </div>
      )}

      {/* TOP TOOLBAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-0.5">
              <span>Robotics Hardware Kit</span>
              <span>•</span>
              <span className="text-sky-500 font-mono">{course.courseId}</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-800 truncate">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {!isGuest && (
            <Link
              to={`/course/${course.courseId}/exam`}
              className={`hidden sm:flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition ${
                isAllModulesCompleted
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Project Certification Exam</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 sm:w-auto sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition"
            title="Toggle Curriculum Sidebar"
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
        {/* LEFT / CENTER VIEWPORT */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          {/* Video or Locked Card */}
          {isStageLockedForGuest ? (
            <div className="bg-slate-900 rounded-3xl p-12 text-center text-white border border-slate-800 flex flex-col items-center justify-center min-h-[360px] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Lock className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-lg font-extrabold text-white mb-1">
                  Enrolled Lab Access Required
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stage 1 is open for free preview. To access Stage {activeModuleIndex + 1} ({activeModule.title}), interactive schematics, and hardware certification, your account must be approved by the Admin as an enrolled student.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModuleIndex(0)}
                className="py-2.5 px-5 bg-sky-500 hover:bg-sky-600 rounded-xl text-xs font-bold text-white transition shadow-sm"
              >
                Back to Stage 1 Free Preview
              </button>
            </div>
          ) : (
            <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-100">
              <HlsVideoPlayer
                key={activeModule.videoUrl}
                src={activeModule.videoUrl}
                title={activeModule.title}
                onEnded={() => {
                  if (!isCurrentModuleDone && !isGuest) {
                    handleMarkAsComplete();
                  }
                }}
              />
            </div>
          )}

          {/* Lesson Action Bar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-sky-500 font-bold mb-1">
                <span>MODULE {activeModuleIndex + 1}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {activeModule.durationMinutes || 20} mins
                </span>
                {isGuest && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {activeModuleIndex === 0 ? 'Free Preview' : 'Locked'}
                  </span>
                )}
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
                  isGuest
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : isCurrentModuleDone
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sky-500/20'
                }`}
              >
                {isGuest ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Preview Only</span>
                  </>
                ) : isCurrentModuleDone ? (
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

          {/* LOWER LAB TABS */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-100 gap-6 text-xs sm:text-sm font-bold mb-6 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveTab('hardware')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-[2px] whitespace-nowrap ${
                  activeTab === 'hardware'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Hardware Components ({activeModule.hardwareChecklist.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wiring')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-[2px] whitespace-nowrap ${
                  activeTab === 'wiring'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Wiring & Pin Schematics ({activeModule.wiringDiagrams.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-[2px] whitespace-nowrap ${
                  activeTab === 'code'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>Embedded Firmware ({activeModule.codeSnippets.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-3 flex items-center gap-2 transition border-b-2 -mb-[2px] whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Lab Overview</span>
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
                <div className="space-y-4 text-xs text-slate-600">
                  <h3 className="text-sm font-bold text-slate-800">
                    About {activeModule.title}
                  </h3>
                  <p className="leading-relaxed">
                    {activeModule.description}
                  </p>
                  <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-2">
                    <span className="font-bold text-sky-900 block">Hardware Kit Specification:</span>
                    <span className="text-sky-800 font-mono">{course.hardwareKit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SYLLABUS SIDEBAR */}
        {isSidebarOpen && (
          <aside className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">
                  Curriculum Syllabus
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isGuest
                    ? 'Stage 1 free preview available'
                    : `${progress.completedModules.length} of ${course.modules.length} video stages completed`}
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center font-bold text-xs">
                {isGuest ? 'P' : `${progress.completionPercentage}%`}
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              {course.modules.map((mod, idx) => {
                const isDone = isModuleCompleted(course.courseId, mod.moduleId);
                const isActive = idx === activeModuleIndex;
                const isLocked = isGuest && idx > 0;

                return (
                  <div
                    key={mod.moduleId || idx}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={`p-3.5 rounded-2xl transition cursor-pointer select-none flex items-start gap-3 border ${
                      isActive
                        ? 'bg-sky-50/70 border-sky-300 text-sky-950 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-amber-500" />
                      ) : isDone ? (
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
                          {mod.durationMinutes || 20}m
                        </span>
                        <span>•</span>
                        <span>{mod.hardwareChecklist.length} parts</span>
                        {isLocked && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-bold">Locked</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End of Course Exam Card */}
              <div
                onClick={() => {
                  if (isAllModulesCompleted && !isGuest) {
                    navigate(`/course/${course.courseId}/exam`);
                  }
                }}
                className={`p-4 rounded-2xl transition flex items-start gap-3 border ${
                  !isGuest && isAllModulesCompleted
                    ? 'bg-amber-50/60 border-amber-300 hover:bg-amber-50 cursor-pointer shadow-xs'
                    : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {!isGuest && isAllModulesCompleted ? (
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
                    {isGuest
                      ? 'Requires enrolled student approval by Admin.'
                      : isAllModulesCompleted
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
