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
  Bookmark, 
  Calendar as CalendarIcon, 
  Video, 
  Bell, 
  MessageCircle, 
  Users, 
  HelpCircle, 
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox
} from 'lucide-react';

type TabType = 'courses' | 'calendar' | 'sessions' | 'notifications' | 'messages' | 'support' | 'peer_chat';

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
  const [simulateNewStudent, setSimulateNewStudent] = useState(false);

  // Referral form state
  const [referralName, setReferralName] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [referralPhone, setReferralPhone] = useState('');
  const [referralCourse, setReferralCourse] = useState('Autonomous Robotics & AI Kit');
  const [referralSuccess, setReferralSuccess] = useState(false);

  // Doubt / Support ticket state
  const [doubtSubject, setDoubtSubject] = useState('');
  const [doubtCategory, setDoubtCategory] = useState('Hardware / Wiring');
  const [doubtMessage, setDoubtMessage] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);

  // Peer chat message state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'Alex Chen', time: '10:14 AM', text: 'Has anyone tested the ESP32 L298N PWM frequency with 2S LiPo?', role: 'Student' },
    { id: 2, author: 'Sannath Koushik', time: '10:20 AM', text: 'Recommend 1000Hz - 2000Hz on ledcSetup to prevent motor whine.', role: 'Lead Mentor' },
    { id: 3, author: 'Priya Sharma', time: '11:05 AM', text: 'Obstacle avoidance sonar trigger pulse is running cleanly now! 🚀', role: 'Student' },
  ]);
  const [myChatInput, setMyChatInput] = useState('');

  // Course access request state for pending students
  const [accessRequested, setAccessRequested] = useState(false);

  useEffect(() => {
    setAllProjects(projectService.getAllProjects());
  }, []);

  // Compute allocated courses for this student
  const realEnrolledProjects = projectService.getEnrolledProjectsForUser(
    simulateNewStudent ? { email: 'simulated@newstudent.edu', role: 'student', enrolledProjectIds: [] } : user
  );

  // Only show courses the student is authorized to view
  const displayCourses = realEnrolledProjects;

  const filteredCourses = displayCourses.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const primaryProject = displayCourses[0];

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReferralSuccess(true);
    setTimeout(() => {
      setReferralName('');
      setReferralEmail('');
      setReferralPhone('');
      setReferralSuccess(false);
    }, 4000);
  };

  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtSubject || !doubtMessage) return;
    setDoubtSubmitted(true);
    setTimeout(() => {
      setDoubtSubject('');
      setDoubtMessage('');
      setDoubtSubmitted(false);
    }, 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myChatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: user?.name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: myChatInput.trim(),
        role: isAdmin ? 'Admin' : 'Student',
      },
    ]);
    setMyChatInput('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* ========================================================= */}
      {/* SUPER ADMIN TOOLBAR                                       */}
      {/* ========================================================= */}
      {isAdmin && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">
              Admin Sandbox: Super Administrator portal active.
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
            className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. THE 4 HERO METRIC CARDS (EXACT INTELLIPAAT STYLE)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Courses To Do (Cyan to Violet Gradient) */}
        <div className="bg-gradient-to-r from-[#00d2ff] via-[#4facfe] to-[#9254de] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xs">
              {displayCourses.length}
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1 text-white/95">
              Courses To Do
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Card 2: Assignment Overdue (Yellow to Orange Gradient) */}
        <div className="bg-gradient-to-r from-[#ffd166] via-[#f59e0b] to-[#f97316] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xs">
              {displayCourses.length > 0 ? 39 : 0}
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1 text-white/95">
              Assignment Overdue
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Card 3: Quiz Overdue (Mint to Cyan Gradient) */}
        <div className="bg-gradient-to-r from-[#20bf6b] via-[#06d6a0] to-[#00b4d8] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xs">
              {displayCourses.length > 0 ? 7 : 0}
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1 text-white/95">
              Quiz Overdue
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <Clock className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Card 4: Completed Course (Lime Green to Mint Gradient) */}
        <div className="bg-gradient-to-r from-[#a3e635] via-[#22c55e] to-[#10b981] rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-xs">
              0
            </div>
            <div className="text-xs sm:text-sm font-bold mt-1 text-white/95">
              Completed Course
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. INTELLIPAAT HORIZONTAL TEXT TABS ROW                   */}
      {/* ========================================================= */}
      <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 overflow-x-auto text-xs font-semibold pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-1 transition-all whitespace-nowrap relative ${
            activeTab === 'courses'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Courses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-1 transition-all whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Calendar
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-1 transition-all whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          My Sessions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 px-1 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Notifications</span>
          <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center">
            35
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-1 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Messages</span>
          <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center">
            0
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-1 transition-all whitespace-nowrap ${
            activeTab === 'support'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Support
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('peer_chat')}
          className={`pb-3 px-1 transition-all whitespace-nowrap ${
            activeTab === 'peer_chat'
              ? 'text-[#7c3aed] font-extrabold border-b-2 border-[#7c3aed]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Peer Chat
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. DYNAMIC CONTENT AREA BASED ON ACTIVE TAB               */}
      {/* ========================================================= */}

      {/* TAB 1: MY COURSES (PRIMARY DUAL-COLUMN INTELLIPAAT VIEW) */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: CURRICULUM, PROGRESS & COURSES LIST (68%) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Certificate Award Notification Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="text-3xl select-none">
                  🎉
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Congratulations! You've Earned Your Certificate
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Link
                      to="/course/skill-assembling-first-robot/exam"
                      className="text-xs font-semibold text-slate-600 hover:text-[#7c3aed] inline-flex items-center gap-1"
                    >
                      <span>Download Certificate</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0">
                <span className="text-[11px] text-slate-400">Share to:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    title="Share to WhatsApp"
                    onClick={() => alert('Certificate share link copied!')}
                    className="w-6 h-6 rounded-full bg-[#25d366]/20 text-[#25d366] flex items-center justify-center font-bold text-xs"
                  >
                    W
                  </button>
                  <button
                    type="button"
                    title="Share to LinkedIn"
                    onClick={() => alert('Certificate share link copied!')}
                    className="w-6 h-6 rounded-full bg-[#0a66c2]/20 text-[#0a66c2] flex items-center justify-center font-bold text-xs"
                  >
                    in
                  </button>
                  <button
                    type="button"
                    title="Share to X"
                    onClick={() => alert('Certificate share link copied!')}
                    className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs"
                  >
                    𝕏
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Filter Row: MY COURSES & Search Bar */}
            <div className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-700 tracking-wider uppercase text-[11px]">
                  MY COURSES ({displayCourses.length})
                </span>
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-slate-400 hover:text-slate-600 cursor-pointer text-[11px] uppercase">
                  FELLOWSHIP
                </span>
              </div>

              <div className="relative w-48 sm:w-60">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed]"
                />
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* IF NO COURSES ASSIGNED YET: Pending Allocation Empty State */}
            {displayCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-2xs text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center mx-auto shadow-2xs">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Account Active • Awaiting Course Allocation</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Welcome to RoboLMS, {user?.name || 'Student'}!
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Your student passport is successfully registered. Hardware courses and live lab kits are allocated directly by your Administrator (<strong className="text-slate-700">sannathkoushik@gmail.com</strong>). Once approved, your assigned hardware projects, video stages, and exams will appear here.
                  </p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-lg mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2.5">
                  <div className="flex items-center gap-2.5 text-emerald-700 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>Step 1: Student Account Created</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-amber-700 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 animate-pulse">
                      <Clock className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span>Step 2: Administrator Course Assignment (In Progress)</span>
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
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Course Allocation Request Submitted!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAccessRequested(true)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c] text-white font-bold text-xs rounded-lg transition shadow-xs"
                    >
                      Request Course Allocation
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('support')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                  >
                    Contact Lead Mentor
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* "Continue where you left.." Card */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 block">
                    Continue where you left..
                  </span>

                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center shrink-0 border border-purple-100">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] font-extrabold text-[10px] mb-1">
                          {primaryProject ? primaryProject.category : 'Robotics Course'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {primaryProject ? primaryProject.title : 'Lecture 5 - Autonomous Obstacle Avoidance'}
                        </h4>
                      </div>
                    </div>

                    <Link
                      to={`/course/${primaryProject?.projectId || 'skill-assembling-first-robot'}`}
                      className="w-full sm:w-auto py-2 px-6 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs inline-flex items-center justify-center gap-1 transition shadow-xs shrink-0"
                    >
                      <span>Continue &gt;</span>
                    </Link>
                  </div>
                </div>

                {/* Program Header Card (Blue ribbon style) */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0ea5e9] text-white flex items-center justify-center shrink-0">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Advanced Certification in Autonomous Robotics & AI Systems
                    </h3>
                  </div>

                  <Link
                    to={`/course/${primaryProject?.projectId || 'skill-assembling-first-robot'}`}
                    className="w-full sm:w-auto py-2 px-5 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c] text-white font-bold text-xs inline-flex items-center justify-center gap-1 transition shadow-xs shrink-0"
                  >
                    <span>Go To Program</span>
                  </Link>
                </div>

                {/* List of Course Module Rows */}
                <div className="space-y-3">
                  {filteredCourses.map((project, idx) => {
                    const prog = getCourseProgress(project.courseId);
                    const isStarted = prog.completionPercentage > 0;
                    const isFirst = idx === 0;

                    return (
                      <div
                        key={project.projectId}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-slate-300"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200/60">
                            <BookOpen className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {project.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>{isStarted ? `${prog.completedModules.length * 15} mins completed` : '0 mins completed'}</span>
                              <span>&bull;</span>
                              <span className="text-emerald-600 font-semibold">Update Available</span>
                            </div>

                            {/* Purple Progress Bar Track with Knob */}
                            <div className="w-full max-w-xs relative py-1">
                              <div className="w-full h-1 bg-purple-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#8b5cf6] rounded-full transition-all duration-300"
                                  style={{ width: `${Math.max(prog.completionPercentage, isFirst ? 35 : 5)}%` }}
                                />
                              </div>
                              <div
                                className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] border-2 border-white absolute top-0.5 shadow-2xs"
                                style={{ left: `${Math.max(prog.completionPercentage, isFirst ? 35 : 5)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right Action Button */}
                        <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                          {isStarted || isFirst ? (
                            <Link
                              to={`/course/${project.projectId}`}
                              className="w-full sm:w-36 py-2 px-4 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c] text-white font-bold text-xs inline-flex items-center justify-center gap-1 transition shadow-xs"
                            >
                              <span>Continue Course</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/course/${project.projectId}`}
                              className="w-full sm:w-36 py-2 px-4 rounded-lg border border-amber-400 text-amber-600 hover:bg-amber-50 font-bold text-xs inline-flex items-center justify-center gap-1 transition"
                            >
                              <span>Start Course</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: REFERRAL & MENTOR CONNECT WIDGET (32%) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Referral Card (Exact IntelliPaat style with blue header & form) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Dark Blue Hero Banner */}
              <div className="bg-gradient-to-r from-[#1a237e] via-[#283593] to-[#3949ab] p-5 text-white flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                    Refer your friend and earn upto Rs. 5000/-
                  </h4>
                  <p className="text-[10px] text-blue-200 mt-1 font-mono">
                    Guaranteed reward on enrollment
                  </p>
                </div>

                {/* Smiling Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shrink-0 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Student"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Form */}
              <div className="p-5">
                {referralSuccess ? (
                  <div className="py-6 text-center space-y-2 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <h5 className="font-bold text-emerald-900 text-xs">Referral Sent!</h5>
                    <p className="text-[11px] text-emerald-700">
                      Your invitation has been sent to your friend. Reward unlocks upon enrollment.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReferralSubmit} className="space-y-3 text-xs">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Referral Full Name*"
                        value={referralName}
                        onChange={(e) => setReferralName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Referral Email Id*"
                        value={referralEmail}
                        onChange={(e) => setReferralEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#7c3aed]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="px-2.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono text-[11px] shrink-0 font-bold">
                        +91 IN
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Number*"
                        value={referralPhone}
                        onChange={(e) => setReferralPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#7c3aed]"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Referral Course Name*"
                        value={referralCourse}
                        onChange={(e) => setReferralCourse(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#7c3aed]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c] text-white font-extrabold text-xs tracking-wide transition shadow-xs"
                    >
                      Send Message
                    </button>

                    <div className="flex items-start gap-1.5 pt-1 text-[10px] text-slate-400 leading-tight">
                      <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#7c3aed]" />
                      <span>
                        By providing your contact details, you agree to our Terms of Use & Privacy Policy.
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* 24/7 Mentor Helpline Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <PhoneCall className="w-4 h-4 text-[#7c3aed]" />
                <span>Dedicated Mentor Doubt Support</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Facing hardware wiring or microcontroller COM port connection errors? Mentors resolve queries in &lt; 45 mins.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-sans text-[11px]">Email Lead Mentor:</span>
                <a href="mailto:sannathkoushik@gmail.com" className="text-[#7c3aed] font-bold hover:underline">
                  sannathkoushik@gmail.com
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#7c3aed]" />
                <span>Hardware Lab & Masterclass Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upcoming live mentoring broadcasts, assignment hand-in milestones, and lab demos.
              </p>
            </div>
            <div className="text-xs font-bold text-[#7c3aed] bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
              November 2026
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#ea580c] uppercase text-[10px] tracking-wide">Live Demo</span>
                <span className="text-slate-500 font-mono">Nov 07 • 06:30 PM</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">ESP32 PWM Motor Speed PID Tuning</h4>
              <p className="text-xs text-slate-500">Live oscillogram measurements of motor back-EMF and noise suppression snubber diodes.</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Mentor: Sannath Koushik</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Registered</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#7c3aed] uppercase text-[10px] tracking-wide">Assignment Due</span>
                <span className="text-slate-500 font-mono">Nov 10 • 11:59 PM</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Obstacle Avoidance FSM Submission</h4>
              <p className="text-xs text-slate-500">Submit video recording of rover executing reverse-and-pivot upon sensing wall at 20cm.</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Weight: 25%</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-[#7c3aed] font-bold text-[10px]">Pending</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-600 uppercase text-[10px] tracking-wide">Lab Test</span>
                <span className="text-slate-500 font-mono">Nov 14 • 04:00 PM</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Robotic Arm Inverse Kinematics Exam</h4>
              <p className="text-xs text-slate-500">Timed 45-minute online quiz with interactive Cartesian angle solver simulator.</p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Pass Mark: 80%</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#7c3aed]" />
              <span>Live Masterclasses & Recorded Sessions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access your real-time instructor sessions, Q&A office hours, and library recordings.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>UPCOMING BROADCAST</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Masterclass: ESP32 Hardware Integration & HLS Video Stream Optimization
                </h4>
                <p className="text-xs text-slate-500">
                  Join Lead Mentor Sannath Koushik live for troubleshooting AWS MediaConvert pipeline, S3 CORS, and ESP32 camera streaming.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('Launching live session room...')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#ea580c] text-white font-bold text-xs rounded-lg shadow-xs hover:from-[#d97706] hover:to-[#c2410c] transition shrink-0"
              >
                Join Live Room
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono">RECORDED REPLAY • 1h 14m</span>
                <h4 className="font-bold text-sm text-slate-800">
                  Session 4: Ultrasonic Sonar Echo Pin Voltage Divider for 3.3V ESP32
                </h4>
                <p className="text-xs text-slate-500">
                  Detailed circuit protection explanation preventing 5V over-voltage damage to GPIO pins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('Opening recording player...')}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg transition shrink-0 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#7c3aed]" />
                <span>Watch Replay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#7c3aed]" />
                <span>Activity & Academic Notifications (35)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stay updated with grading feedback, newly unlocked stages, and lab kit dispatch notices.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert('All notifications marked as read')}
              className="text-xs font-bold text-[#7c3aed] hover:underline"
            >
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'New HLS Video Stage Available', desc: 'Stage 2: gemini generated video fac0cdb7 has been encoded with adaptive bitrate HLS streaming.', time: '10 mins ago', type: 'system' },
              { title: 'Certificate Issued', desc: 'Your certificate for Assembling Your First Robot has been issued with serial #ROBO-CERT-2026.', time: '2 hours ago', type: 'award' },
              { title: 'Assignment Reminder: Rover Obstacle Avoidance', desc: 'Your hardware video verification is due in 3 days. Ensure LiPo battery is fully charged.', time: '1 day ago', type: 'assignment' },
              { title: 'Peer Discussion Reply', desc: 'Alex Chen replied to your thread in #hardware-debugging.', time: '2 days ago', type: 'peer' },
            ].map((n, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#7c3aed] flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#7c3aed]" />
              <span>Mentor & Instructor Direct Messages</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct communication line with Lead Instructor Sannath Koushik.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a237e] text-white flex items-center justify-center font-bold text-sm">
                SK
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Sannath Koushik (Lead Mentor)</h4>
                <p className="text-[11px] text-emerald-600 font-medium">● Online • Ready to assist with hardware builds</p>
              </div>
            </div>
            <a
              href="mailto:sannathkoushik@gmail.com"
              className="px-4 py-2 bg-[#7c3aed] text-white font-bold text-xs rounded-lg hover:bg-purple-700 transition"
            >
              Send Email
            </a>
          </div>

          <div className="text-center py-8 text-xs text-slate-400 space-y-2">
            <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No unread mentor message threads. You are completely caught up!</p>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT & DOUBTS */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#7c3aed]" />
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
                  Ticket reference #DOUBT-{Date.now().toString().slice(-5)} logged. Lead mentor Sannath Koushik will email you at {user?.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDoubtSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
                  <select
                    value={doubtCategory}
                    onChange={(e) => setDoubtCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option>Hardware / Wiring / Motor Driver</option>
                    <option>ESP32 Firmware Flash / COM Port</option>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#d97706] hover:to-[#c2410c] text-white font-extrabold text-xs transition shadow-xs"
                >
                  Submit Ticket to Lead Mentor
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#7c3aed]" />
                <span>Immediate Assistance</span>
              </h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                For urgent build issues during live workshops, you can reach out directly via:
              </p>
              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Lead Mentor:</span>
                  <a href="mailto:sannathkoushik@gmail.com" className="text-[#7c3aed] font-bold">
                    sannathkoushik@gmail.com
                  </a>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Support Hours:</span>
                  <span className="text-slate-800 font-bold">09:00 AM – 09:00 PM IST</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 text-xs">
              <h4 className="font-extrabold text-slate-900">Frequently Asked Questions</h4>
              <details className="cursor-pointer py-1 border-b border-slate-100">
                <summary className="font-bold text-slate-700 hover:text-[#7c3aed]">How do I unlock additional courses?</summary>
                <p className="text-[11px] text-slate-500 pt-1">
                  Once you enroll through the admissions portal, Administrator Sannath Koushik assigns the specific kit and course directly to your student email.
                </p>
              </details>
              <details className="cursor-pointer py-1 border-b border-slate-100">
                <summary className="font-bold text-slate-700 hover:text-[#7c3aed]">Why does HLS video have adaptive quality?</summary>
                <p className="text-[11px] text-slate-500 pt-1">
                  Our AWS MediaConvert pipeline generates 1080p, 720p, and 480p streams automatically adjusting to your network speed.
                </p>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PEER CHAT / COMMUNITY */}
      {activeTab === 'peer_chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">RoboLMS Student Peer Lounge</h4>
                <p className="text-[10px] text-emerald-600 font-medium">● 42 peers active in robotics discussions</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Channel: #hardware-builds</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800">{msg.author}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    msg.role === 'Lead Mentor' || msg.role === 'Admin'
                      ? 'bg-purple-100 text-[#7c3aed] font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{msg.time}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 shadow-2xs max-w-xl">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Ask peers a question or share your rover build progress..."
              value={myChatInput}
              onChange={(e) => setMyChatInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#7c3aed]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
