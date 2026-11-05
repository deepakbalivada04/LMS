import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  LogOut, 
  User, 
  ChevronDown, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export const TopHeader: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/login');
  };

  const studentName = user?.name || user?.email.split('@')[0] || 'Koushik Sannath';

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: IntelliPaat Style Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="flex items-baseline">
              <span className="text-2xl font-extrabold tracking-tight text-[#1a237e] font-sans">
                Intelli
              </span>
              <span className="text-2xl font-black text-[#f59e0b] tracking-tight font-sans">
                Paat
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 pl-2 ml-2 border-l border-slate-200 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              <span>RoboLMS</span>
            </div>
          </Link>

          {/* Right: User Name & Admin Pill */}
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1"
              >
                <span>{studentName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-xs animate-fade-in font-sans">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="font-bold text-slate-800 truncate">{studentName}</p>
                    <p className="text-slate-400 text-[11px] font-mono truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>My Courses</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowDropdown(false)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-emerald-700 font-bold flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Super Admin</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
