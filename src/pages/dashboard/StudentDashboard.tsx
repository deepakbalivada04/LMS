import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { HardwareProject } from '../../types/course';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Clock, 
  Award, 
  BookOpen, 
  Play, 
  Download, 
  Search, 
  Shield, 
  Eye, 
  Check, 
  PhoneCall, 
  FileText,
  HelpCircle, 
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Share2,
  Calendar
} from 'lucide-react';

type TabType = 'courses' | 'assignments' | 'quizzes' | 'certifications' | 'support';

interface AssignmentItem {
  id: string;
  title: string;
  courseTitle: string;
  courseId: string;
  dueDate: string;
  points: number;
  status: 'graded' | 'submitted' | 'due_soon' | 'pending';
  grade?: string;
  description: string;
}

const SAMPLE_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'Dual Motor L298N Wiring & Common Ground Verification',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    courseId: 'crs-esp32-rover',
    dueDate: 'Nov 12, 2026',
    points: 100,
    status: 'graded',
    grade: '96/100',
    description: 'Verify wiring from ESP32 PWM pins to L298N motor driver inputs. Ensure LiPo GND is tied together with MCU GND.',
  },
  {
    id: 'asg-2',
    title: 'Ultrasonic Sonar Echo 3.3V Voltage Divider Protection',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    courseId: 'crs-esp32-rover',
    dueDate: 'Nov 16, 2026',
    points: 100,
    status: 'submitted',
    description: 'Calculate and solder 1kΩ / 2kΩ resistor divider to step down HC-SR04 5V Echo pulse before it reaches GPIO 18.',
  },
  {
    id: 'asg-3',
    title: 'Obstacle Detection State Machine & Turn Trajectory Run',
    courseTitle: 'Autonomous Obstacle-Avoiding Rover Kit',
    courseId: 'crs-esp32-rover',
    dueDate: 'Nov 20, 2026',
    points: 100,
    status: 'due_soon',
    description: 'Record a 30-second continuous run of the rover detecting a wall at 20cm, executing reverse-turn, and resuming cruise.',
  },
  {
    id: 'asg-4',
    title: 'Multimeter Voltage Rail & Short Circuit Diagnostics',
    courseTitle: 'Debugging a Robot That Won\'t Move',
    courseId: 'skill-debugging-dead-robot',
    dueDate: 'Nov 25, 2026',
    points: 100,
    status: 'pending',
    description: 'Measure voltage drop across motor terminals under stall current. Record continuity beep checks across battery switches.',
  },
];

export const StudentDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { getCourseProgress } = useProgress();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get('tab') as TabType) || 'courses';
  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const [allProjects, setAllProjects] = useState<HardwareProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [simulateNewStudent, setSimulateNewStudent] = useState(false);

  // Assignment submission modal / state
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);

  // Doubt ticket state
  const [doubtSubject, setDoubtSubject] = useState('');
  const [doubtCategory, setDoubtCategory] = useState('Hardware / Wiring');
  const [doubtMessage, setDoubtMessage] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);

  // Course access request state for pending students
  const [accessRequested, setAccessRequested] = useState(false);

  useEffect(() => {
    setAllProjects(projectService.getAllProjects());
  }, []);

  // Compute allocated courses for this student
  const realEnrolledProjects = projectService.getEnrolledProjectsForUser(
    simulateNewStudent ? { email: 'simulated@newstudent.edu', role: 'student', enrolledProjectIds: [] } : user
  );

  const displayCourses = realEnrolledProjects;

  const filteredCourses = displayCourses.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
      p.category.toLowerCase().replace(/[^a-z0-9]/g, '').includes(selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, ''));
    return matchesSearch && matchesCategory;
  });

  const primaryProject = displayCourses[0];

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignmentId || !submissionUrl) return;
    setSubmittedIds((prev) => [...prev, submittingAssignmentId]);
    setSubmittingAssignmentId(null);
    setSubmissionUrl('');
    setSubmissionNotes('');
  };

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtSubject || !doubtMessage) return;
    setDoubtSubmitted(true);
    setTimeout(() => {
      setDoubtSubject('');
      setDoubtMessage('');
      setDoubtSubmitted(false);
    }, 4500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-3">
      {/* ========================================================= */}
      {/* SUPER ADMIN TOOLBAR                                       */}
      {/* ========================================================= */}
      {isAdmin && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Admin Sandbox: Super Administrator privileges active.
            </span>
            <button
              type="button"
              onClick={() => setSimulateNewStudent((prev) => !prev)}
              className={`ml-2 px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                simulateNewStudent
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{simulateNewStudent ? 'Simulating New Student' : 'Simulate New Student'}</span>
            </button>
          </div>
          <Link
            to="/admin"
            className="py-1 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. ORIGINAL METRIC CARDS (NO COPYRIGHT / CLEAN SAAS DESIGN) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Courses */}
        <div 
          onClick={() => setActiveTab('courses')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'courses' ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' : 'border-slate-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Courses
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {displayCourses.length}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {displayCourses.length > 0 ? 'Active Curriculum' : 'Awaiting Batch'}
            </span>
          </div>
        </div>

        {/* Card 2: Assignments */}
        <div 
          onClick={() => setActiveTab('assignments')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'assignments' ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' : 'border-slate-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assignments
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {SAMPLE_ASSIGNMENTS.length}
            </span>
            <span className="text-xs font-semibold text-amber-600">
              1 Due This Week
            </span>
          </div>
        </div>

        {/* Card 3: Quizzes */}
        <div 
          onClick={() => setActiveTab('quizzes')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'quizzes' ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' : 'border-slate-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quizzes & Tests
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {displayCourses.length > 0 ? displayCourses.length : 4}
            </span>
            <span className="text-xs font-semibold text-cyan-600">
              Skills Evaluated
            </span>
          </div>
        </div>

        {/* Card 4: Certifications */}
        <div 
          onClick={() => setActiveTab('certifications')}
          className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all hover:shadow-md ${
            activeTab === 'certifications' ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/20' : 'border-slate-200/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Certifications
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              1
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              Verified Certificate
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THE 5 CLEAN NAVIGATION TABS                            */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'courses'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Courses</span>
          {displayCourses.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
              {displayCourses.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'assignments'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold">
            {SAMPLE_ASSIGNMENTS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'quizzes'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quizzes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'certifications'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'support'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. DYNAMIC CONTENT SECTION                                */}
      {/* ========================================================= */}

      {/* TAB 1: MY COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* If No Courses Assigned Yet: Commercial LMS Pending State */}
          {displayCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200/90 shadow-2xs text-center space-y-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto shadow-2xs">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200/60">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Account Registered • Awaiting Course Allocation</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Welcome to RoboLMS, {user?.name || 'Student'}!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Your student passport has been created successfully. In our academy, specialized robotics courses and hardware kits are allocated directly by the Lead Administrator (<strong className="text-slate-700">sannathkoushik@gmail.com</strong>). Once approved, your assigned hardware projects, video stages, and exams will appear right here.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Step 1: Student Account Registered</span>
                </div>
                <div className="flex items-center gap-2.5 text-amber-700 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 animate-pulse">
                    <Clock className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>Step 2: Administrator Course Assignment (Awaiting Approval)</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 font-medium">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </div>
                  <span>Step 3: Access Hardware Videos, BOM & Lab Simulators</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {accessRequested ? (
                  <div className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Allocation Request Sent to sannathkoushik@gmail.com</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAccessRequested(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    Request Course Allocation
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Contact Lead Mentor
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Continue Learning Spotlight Hero Card */}
              {primaryProject && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Resume Your Active Hardware Lab</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                      {primaryProject.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {primaryProject.description}
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 font-mono">
                      <span>{primaryProject.modules?.length || 2} Video Stages</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400 font-semibold">HLS Video Streaming Ready</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 relative z-10 w-full md:w-auto">
                    <Link
                      to={`/course/${primaryProject.projectId}`}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-xs inline-flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-500/20"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Continue Learning</span>
                    </Link>
                    <Link
                      to={`/course/${primaryProject.projectId}/exam`}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Skill Quiz</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {['ALL', 'Robot Kits', 'How AI Thinks', 'Space & Hardware', 'Prompting'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition text-xs whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search allocated courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((project) => {
                  const prog = getCourseProgress(project.courseId);
                  const isStarted = prog.completionPercentage > 0;

                  return (
                    <div
                      key={project.projectId}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      {/* Top Header Strip */}
                      <div className="p-5 pb-4 space-y-2 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wide border border-indigo-100/80">
                            {project.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {project.modules?.length || 1} Stages
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                          {project.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="pt-3 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500 font-sans">Lab Progress</span>
                            <span className="font-bold text-slate-900">{prog.completionPercentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(prog.completionPercentage, 5)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/course/${project.projectId}`}
                          className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isStarted ? 'Resume Lab' : 'Start Course'}</span>
                        </Link>
                        <Link
                          to={`/course/${project.projectId}/exam`}
                          className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center justify-center transition"
                          title="Take Quiz"
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span>Hands-on Hardware Lab Assignments</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete each practical hardware build milestone and submit your video verification or firmware link.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60 font-mono">
                {SAMPLE_ASSIGNMENTS.length} Total Assignments
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {SAMPLE_ASSIGNMENTS.map((asg) => {
              const isSubmitted = submittedIds.includes(asg.id) || asg.status === 'submitted' || asg.status === 'graded';

              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:border-slate-300"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {asg.courseTitle}
                      </span>
                      {asg.status === 'graded' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Graded • {asg.grade}</span>
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-600" />
                          <span>Under Mentor Review</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Due: {asg.dueDate}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">
                      {asg.title}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {asg.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                      <span>Max Points: {asg.points}</span>
                      <span>&bull;</span>
                      <span>Evaluation: Lead Mentor Sannath Koushik</span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0">
                    {asg.status === 'graded' ? (
                      <div className="text-center md:text-right">
                        <span className="text-xs font-bold text-emerald-600 block">Verified Pass</span>
                        <span className="text-[11px] text-slate-400 font-mono">Score: {asg.grade}</span>
                      </div>
                    ) : isSubmitted ? (
                      <div className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold text-center">
                        Submitted &bull; Awaiting Grade
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSubmittingAssignmentId(asg.id)}
                        className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                      >
                        Submit Video Proof / Code
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Modal */}
          {submittingAssignmentId && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Submit Assignment Proof
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSubmittingAssignmentId(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleAssignmentSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Video Demonstration URL or GitHub Code Repository*
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://youtu.be/... or https://github.com/..."
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Upload an unlisted YouTube video showing the physical rover test or paste your GitHub firmware repo.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Notes for Mentor (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Added a 100uF capacitor across the motor rail to smooth voltage spikes..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignmentId(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow-xs"
                    >
                      Submit for Evaluation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-600" />
              <span>Skill Evaluation Quizzes & Knowledge Checks</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Timed interactive exams testing circuit wiring, firmware logic, and hardware debugging. Passing score is 80%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'skill-assembling-first-robot',
                title: 'Assembling Your First Robot: Wiring & Motor Fundamentals',
                questions: 10,
                timeMins: 15,
                passMark: 80,
                status: 'Passed (90%)',
                category: 'Robot Kits',
              },
              {
                id: 'skill-debugging-dead-robot',
                title: 'Debugging a Robot That Won\'t Move: Continuity & Voltage Drops',
                questions: 10,
                timeMins: 15,
                passMark: 80,
                status: 'Ready to Take',
                category: 'Space & Hardware',
              },
              {
                id: 'crs-esp32-rover',
                title: 'ESP32 Autonomous Obstacle-Avoidance Rover Quiz',
                questions: 12,
                timeMins: 20,
                passMark: 80,
                status: 'Ready to Take',
                category: 'Robot Kits',
              },
              {
                id: 'skill-how-rover-finds-its-way',
                title: 'How a Rover Finds Its Way: Sonar & Sensor Fusion',
                questions: 8,
                timeMins: 10,
                passMark: 80,
                status: 'Ready to Take',
                category: 'Space & Hardware',
              },
            ].map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4 transition hover:border-slate-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-100">
                      {quiz.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      quiz.status.includes('Passed') 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {quiz.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {quiz.title}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{quiz.questions} Questions</span>
                    <span>&bull;</span>
                    <span>{quiz.timeMins} Mins</span>
                    <span>&bull;</span>
                    <span className="text-slate-600 font-semibold">{quiz.passMark}% to Pass</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">Timed Multiple Choice</span>
                  <Link
                    to={`/course/${quiz.id}/exam`}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
                  >
                    <span>{quiz.status.includes('Passed') ? 'Retake Quiz' : 'Start Quiz'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Official Hardware Lab Certifications</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified certificates issued upon completing practical build milestones and passing skill quizzes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
            {/* Certificate Preview Card */}
            <div className="border-4 border-double border-indigo-200 rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 text-center space-y-4 relative overflow-hidden shadow-xs">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-bold">
                  FLYnBRD RoboLMS Academy &bull; Certificate of Mastery
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Autonomous Robotics & Hardware Systems
                </h3>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                This certifies that <strong className="text-slate-900">{user?.name || 'Koushik Sannath'}</strong> has demonstrated proficiency in microcontroller interfacing, PWM motor speed controllers, and sensor fusion.
              </p>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
                <span>Credential ID: <strong className="text-slate-800">ROBO-CERT-2026-ESP32</strong></span>
                <span>Issued: <strong className="text-slate-800">November 2026</strong></span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Authentic</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Share Credential:</span>
                <button
                  type="button"
                  onClick={() => alert('Certificate link copied to clipboard!')}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Copy Link
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/course/skill-assembling-first-robot/exam"
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Certificate</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Submit a Doubt or Hardware Ticket</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our lab engineering team typically replies within 45 minutes during lab hours.
              </p>
            </div>

            {doubtSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-extrabold text-sm text-emerald-900">Support Ticket Created!</h4>
                <p className="text-xs text-emerald-700">
                  Ticket reference #ROBO-TKT-{Date.now().toString().slice(-5)} logged. Lead mentor Sannath Koushik will email you at {user?.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDoubtSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                  <select
                    value={doubtCategory}
                    onChange={(e) => setDoubtCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option>Hardware / Wiring / Motor Driver</option>
                    <option>ESP32 Firmware Flash / COM Port Connection</option>
                    <option>S3 Video Streaming / HLS Playback</option>
                    <option>Course Allocation & Enrollment</option>
                    <option>Certification Exam Verification</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Doubt Subject*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. L298N motor driver heat sink getting warm on 2S battery"
                    value={doubtSubject}
                    onChange={(e) => setDoubtSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Detailed Description*</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your wiring connections, supply voltage, and any error logs from the Arduino / ESP-IDF serial monitor..."
                    value={doubtMessage}
                    onChange={(e) => setDoubtMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-xs"
                >
                  Submit Ticket to Lead Mentor
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>Direct Lead Mentor Helpline</span>
              </h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Have questions about kit assembly or microcontroller pin multiplexing? Mentors answer directly:
              </p>
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Lead Mentor:</span>
                  <a href="mailto:sannathkoushik@gmail.com" className="text-indigo-600 font-bold hover:underline">
                    sannathkoushik@gmail.com
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Academy Lab:</span>
                  <span className="text-slate-800 font-bold">09:00 AM – 09:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900">Frequently Asked Questions</h4>
              <details className="cursor-pointer py-1.5 border-b border-slate-100">
                <summary className="font-bold text-slate-700 hover:text-indigo-600">How do I unlock additional courses?</summary>
                <p className="text-[11px] text-slate-500 pt-1">
                  Once you enroll in a new hardware batch, Administrator Sannath Koushik assigns the specific kit and course directly to your student email.
                </p>
              </details>
              <details className="cursor-pointer py-1.5 border-b border-slate-100">
                <summary className="font-bold text-slate-700 hover:text-indigo-600">Why does HLS video have adaptive quality?</summary>
                <p className="text-[11px] text-slate-500 pt-1">
                  Our AWS MediaConvert pipeline generates 1080p, 720p, and 480p streams automatically adjusting to your network speed.
                </p>
              </details>
              <details className="cursor-pointer py-1.5 border-b border-slate-100">
                <summary className="font-bold text-slate-700 hover:text-indigo-600">What if my ESP32 COM port is not detected?</summary>
                <p className="text-[11px] text-slate-500 pt-1">
                  Install the CP2102 or CH340 USB-to-UART bridge driver from Silicon Labs / WCH, and ensure your USB cable supports data transfer.
                </p>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
