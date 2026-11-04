import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Mail, 
  LayoutGrid, 
  MessageSquare, 
  FileEdit, 
  Clock, 
  BookOpen, 
  Database, 
  ShieldCheck, 
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';

export const SidebarRail: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', icon: Home, path: '/dashboard', label: 'Dashboard' },
    { id: 'course', icon: BookOpen, path: '/course/crs-esp32-rover', label: 'Active Lab' },
    { id: 'exam', icon: Award, path: '/course/crs-esp32-rover/exam', label: 'Exam & Cert' },
    { id: 'messages', icon: Mail, path: '/dashboard', label: 'Inbox' },
    { id: 'grid', icon: LayoutGrid, path: '/dashboard', label: 'Modules' },
    { id: 'chat', icon: MessageSquare, path: '/dashboard', label: 'Community' },
    { id: 'notes', icon: FileEdit, path: '/dashboard', label: 'Firmware Notes' },
    { id: 'schedule', icon: Clock, path: '/dashboard', label: 'Lab Schedule' },
    { id: 'database', icon: Database, path: '/dashboard', label: 'Telemetry DB' },
    { id: 'security', icon: ShieldCheck, path: '/dashboard', label: 'Access Control' },
  ];

  const isActive = (path: string, id: string) => {
    if (id === 'dashboard') return location.pathname === '/dashboard';
    if (id === 'course') return location.pathname.startsWith('/course') && !location.pathname.includes('/exam');
    if (id === 'exam') return location.pathname.includes('/exam');
    return false;
  };

  return (
    <aside className="w-18 md:w-20 bg-white border-r border-slate-100 flex flex-col items-center py-6 shrink-0 z-30 shadow-sm">
      {/* Brand Logo - Abstract colorful mark as seen in the screenshot */}
      <Link to="/dashboard" className="mb-8 group flex items-center justify-center">
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-pink-500 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1 p-1">
              <span className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Icons Stack */}
      <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.id);

          return (
            <Link
              key={item.id}
              to={item.path}
              title={item.label}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                active
                  ? 'bg-sky-50 text-sky-500 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Help / Status Icon */}
      <div className="pt-4 border-t border-slate-100 w-full flex justify-center">
        <button
          type="button"
          title="Hardware Telemetry Status"
          className="w-10 h-10 rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

