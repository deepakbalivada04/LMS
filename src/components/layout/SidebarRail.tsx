import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Award, GraduationCap } from 'lucide-react';

export const SidebarRail: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      path: '/dashboard', 
      label: 'My Learning' 
    },
    { 
      id: 'course', 
      icon: BookOpen, 
      path: '/course/crs-esp32-rover', 
      label: 'Hardware Lab' 
    },
    { 
      id: 'exam', 
      icon: Award, 
      path: '/course/crs-esp32-rover/exam', 
      label: 'Certifications' 
    },
  ];

  const isActive = (path: string, id: string) => {
    if (id === 'dashboard') return location.pathname === '/dashboard';
    if (id === 'course') return location.pathname.startsWith('/course') && !location.pathname.includes('/exam');
    if (id === 'exam') return location.pathname.includes('/exam');
    return false;
  };

  return (
    <aside className="w-18 md:w-20 bg-white border-r border-slate-100 flex flex-col items-center py-6 shrink-0 z-30 shadow-xs">
      {/* Brand Mark */}
      <Link to="/dashboard" className="mb-8 group flex items-center justify-center">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#2bb398] p-0.5 shadow-sm group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-sky-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </Link>

      {/* Navigation Icons (Only real student destinations) */}
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
                  ? 'bg-sky-50 text-sky-600 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Cert Badge */}
      <div className="pt-4 border-t border-slate-100 w-full flex justify-center">
        <Link
          to="/course/crs-esp32-rover/exam"
          title="Certification Portal"
          className="w-10 h-10 rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition"
        >
          <Award className="w-5 h-5" />
        </Link>
      </div>
    </aside>
  );
};
