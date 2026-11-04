import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  MessageSquare, 
  Maximize, 
  SlidersHorizontal, 
  LogOut, 
  BookOpen,
  Award,
  User
} from 'lucide-react';

interface TopHeaderProps {
  onToggleSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = async () => {
    setShowSettingsMenu(false);
    await logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const studentName = user?.name || 'Robotics Student';

  return (
    <header className="h-20 px-6 sm:px-8 flex items-center justify-between gap-4 z-20">
      {/* Left: Hamburger Menu & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input with rounded style as seen in screenshot */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search robotics modules, hardware BOM, pinouts..."
            className="w-full bg-white border border-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-700 placeholder-slate-400 shadow-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
          />
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle (Moon / Sun) */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 hover:bg-slate-50 transition"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 hover:bg-slate-50 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2.5 right-2.5 ring-2 ring-white" />
        </button>

        {/* Messages */}
        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 hover:bg-slate-50 transition"
          title="Community Messages"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Country Flag (US) */}
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-base select-none">
          🇺🇸
        </div>

        {/* Fullscreen Expand Icon */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-sky-500 hover:bg-slate-50 transition"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Student Profile Pill */}
        <div className="relative">
          <div
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl p-1.5 pr-2.5 shadow-sm cursor-pointer hover:bg-slate-50 transition"
          >
            <div className="text-right hidden sm:block pl-1">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {studentName}
              </div>
              <div className="text-[10px] font-bold text-sky-500 tracking-wider uppercase">
                STUDENT
              </div>
            </div>

            {/* Avatar matching circular avatar in the screenshot */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-200 to-amber-400 p-0.5 overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Student Avatar"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>

            <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-1" />
          </div>

          {/* Student Menu Dropdown */}
          {showSettingsMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{studentName}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setShowSettingsMenu(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4 text-sky-500" />
                <span>My Active Labs</span>
              </Link>

              <Link
                to="/course/crs-esp32-rover/exam"
                onClick={() => setShowSettingsMenu(false)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-600 flex items-center gap-2 transition"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>My Certificates</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 font-semibold flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
