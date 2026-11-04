import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SAMPLE_COURSES } from '../../lib/mockData';
import { useProgress } from '../../context/ProgressContext';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Users, 
  Plus, 
  MoreVertical, 
  Calendar, 
  ArrowUpRight, 
  Play, 
  TrendingUp, 
  Award, 
  ChevronRight,
  Bot,
  Cpu,
  Sparkles
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getCourseProgress } = useProgress();
  const navigate = useNavigate();

  const esp32Progress = getCourseProgress('crs-esp32-rover');

  const popularCourses = [
    {
      id: 'crs-esp32-rover',
      badgeLetter: 'U',
      badgeBg: 'bg-amber-400 text-white',
      title: 'UI/UX & Autonomous ESP32 Rover',
      coursesCount: '30+ Modules',
      path: '/course/crs-esp32-rover',
    },
    {
      id: 'crs-robotic-arm-kinematics',
      badgeLetter: 'M',
      badgeBg: 'bg-rose-500 text-white',
      title: '6-DOF Robotic Arm & Kinematics',
      coursesCount: '25+ Modules',
      path: '/course/crs-robotic-arm-kinematics',
    },
    {
      id: 'web-iot',
      badgeLetter: 'W',
      badgeBg: 'bg-teal-500 text-white',
      title: 'Web Dev & Micro-XRCE Telemetry',
      coursesCount: '30+ Modules',
      path: '/course/crs-esp32-rover',
    },
    {
      id: 'math-kinematics',
      badgeLetter: 'M',
      badgeBg: 'bg-sky-500 text-white',
      title: 'Mathematics & Kinematic Control',
      coursesCount: '50+ Modules',
      path: '/course/crs-robotic-arm-kinematics',
    },
  ];

  const bestInstructors = [
    {
      name: 'Nil Yeager',
      role: '5 Design Course',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Theron Trump',
      role: '5 Design Course',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Tyler Mark',
      role: '5 Design Course',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    {
      name: 'Johen Mark',
      role: '5 Design Course',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ======================================================== */}
      {/* TOP ROW: GREEN HERO BANNER (LEFT) + ACTION CARD (RIGHT)  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Large Teal Hero Banner matching screenshot */}
        <div className="lg:col-span-8 bg-gradient-to-r from-[#2bb398] via-[#24a58b] to-[#1e967d] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[220px]">
          {/* Subtle gradient pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          {/* Banner Text Header */}
          <div className="max-w-md relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Learn With Effectively With Us!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium">
              Hardware, robotics, & embedded cloud telemetry labs. Get 30% off every course on january.
            </p>
          </div>

          {/* Banner Stat Badges (Red + Yellow pills from screenshot) */}
          <div className="flex flex-wrap items-center gap-4 mt-6 relative z-10">
            {/* Red Badge: Students */}
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-emerald-100 block font-medium">Students</span>
                <span className="text-xs font-bold text-white">75,000+</span>
              </div>
            </div>

            {/* Yellow Badge: Mentors */}
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[11px] text-emerald-100 block font-medium">Expert Mentors</span>
                <span className="text-xs font-bold text-white">200+</span>
              </div>
            </div>
          </div>

          {/* Right Floating Graduating Figures Graphic (matching screenshot) */}
          <div className="hidden md:flex absolute right-6 bottom-4 items-end gap-2 pointer-events-none select-none">
            <div className="text-7xl opacity-90 drop-shadow-md">👨‍🎓</div>
            <div className="text-8xl opacity-95 drop-shadow-md -ml-3">👩‍🎓</div>
            <div className="text-7xl opacity-90 drop-shadow-md -ml-3">🧑‍🎓</div>
          </div>
        </div>

        {/* Right Side: Have More Knowledge to share Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-800 leading-snug">
              Have More knowledge to share?
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Launch new hardware modules or start your active lab
            </p>

            {/* Blue Button: + Create New Course / Launch Lab */}
            <Link
              to="/course/crs-esp32-rover"
              className="mt-4 w-full py-3 px-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 transition transform active:scale-98"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create New Course / Launch Lab
            </Link>
          </div>

          {/* Two Stats Boxes (Courses in Progress: 5, Forum Discussion: 25) */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-[#f8fafc] rounded-2xl p-4 text-center border border-slate-100">
              <span className="text-[11px] font-semibold text-sky-500 block">Courses in Progress</span>
              <span className="text-3xl font-extrabold text-slate-800 mt-1 block">5</span>
            </div>
            <div className="bg-[#f8fafc] rounded-2xl p-4 text-center border border-slate-100">
              <span className="text-[11px] font-semibold text-sky-500 block">Forum Discussion</span>
              <span className="text-3xl font-extrabold text-slate-800 mt-1 block">25</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MIDDLE SECTION (3 EQUAL COLUMNS)                        */}
      {/* 1. Popular Courses | 2. Current Activity | 3. Instructors*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: POPULAR COURSES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-slate-800">Popular Courses</h3>
            <Link to="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-sky-500 transition">
              All Courses
            </Link>
          </div>

          <div className="space-y-4">
            {popularCourses.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Badge letter with colored box */}
                  <div className={`w-10 h-10 rounded-xl ${c.badgeBg} flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                    {c.badgeLetter}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-500 transition">
                      {c.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">{c.coursesCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={c.path}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-500 bg-amber-50 hover:bg-amber-100 transition"
                  >
                    View Courses
                  </Link>
                  <button className="text-slate-300 hover:text-slate-500 p-1">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: CURRENT ACTIVITY (MONTHLY PROGRESS CHART + 2 METRIC CARDS) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-800">Current Activity</h3>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Monthly Progress</span>
                <span className="text-[11px] text-slate-400">This is the latest improvement</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* Smooth Blue Area Line Chart (SVG replicated from screenshot) */}
            <div className="w-full h-36 relative select-none">
              <svg className="w-full h-full" viewBox="0 0 320 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="30" y1="20" x2="310" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="50" x2="310" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="80" x2="310" y2="80" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y-Axis Labels */}
                <text x="5" y="24" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">60%</text>
                <text x="5" y="54" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">40%</text>
                <text x="5" y="84" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">20%</text>
                <text x="10" y="108" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">0%</text>

                {/* Wave Area Fill */}
                <path
                  d="M 30,105 Q 60,100 90,80 T 150,75 T 210,50 T 270,30 L 310,22 L 310,105 Z"
                  fill="url(#blueWave)"
                />

                {/* Main Blue Stroke Line */}
                <path
                  d="M 30,105 Q 60,100 90,80 T 150,75 T 210,50 T 270,30 L 310,22"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* X-Axis Labels */}
                <text x="45" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Jan</text>
                <text x="95" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Feb</text>
                <text x="145" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Mar</text>
                <text x="195" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Apr</text>
                <text x="245" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">May</text>
                <text x="290" y="118" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Jun</text>
              </svg>
            </div>
          </div>

          {/* Two Color Metric Cards Below Chart: Yellow/Amber & Pink/Red */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Yellow Card: 450K+ Completed Course */}
            <div className="bg-amber-400 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xl font-black block leading-tight">450K+</span>
                <span className="text-xs font-semibold block opacity-95">Completed Course</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2">
                <span className="text-[10px] opacity-80">This is the latest Data</span>
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Pink Card: 200K+ Video Course */}
            <div className="bg-[#f43f5e] rounded-2xl p-4 text-white flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xl font-black block leading-tight">200K+</span>
                <span className="text-xs font-semibold block opacity-95">Video Course</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2">
                <span className="text-[10px] opacity-80">HLS Streaming</span>
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-white">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: BEST INSTRUCTORS */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm text-slate-800">Best Instructors</h3>
            <Link to="/dashboard" className="text-xs font-semibold text-slate-400 hover:text-sky-500 transition">
              See All
            </Link>
          </div>

          <div className="space-y-4">
            {bestInstructors.map((inst, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="w-10 h-10 rounded-xl object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{inst.name}</h4>
                    <span className="text-[11px] text-slate-400">{inst.role}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Courses
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM SECTION: 3 CARDS AS SEEN AT THE BOTTOM OF IMAGE   */}
      {/* 1. Top 5 Performance | 2. Pass Rate | 3. Content Usage   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-slate-800">Top 5 School Performance</h4>
            <span className="text-[10px] text-slate-400">Term 2026</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">94.8%</span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Average robotics microcontroller score</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-slate-800">Overall Pass Percentage</h4>
            <span className="text-[10px] text-slate-400">Exam Metric</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0ea5e9]">88.5%</span>
            <span className="text-xs font-semibold text-slate-400">Score &gt; 80%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Certificates issued with S3 pre-signed downloads</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-xs text-slate-800">Content Usage</h4>
            <span className="text-[10px] text-slate-400">HLS Telemetry</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">1.8 TB</span>
            <span className="text-xs font-semibold text-slate-400">CloudFront CDN</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Adaptive video streaming across 1080p and 720p</p>
        </div>
      </div>
    </div>
  );
};
