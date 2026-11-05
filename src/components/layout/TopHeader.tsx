import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import companyLogo from '../../assets/text_logo.png';
import { 
  Shield, 
  LogOut, 
  ChevronDown, 
  BookOpen,
  Award,
  HelpCircle,
  FileText
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

  const studentName = user?.name || user?.email.split('@')[0] || 'Student';

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Official Company Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
            />
          </Link>

          {/* Right: User Name, Admin Link, & Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs border border-slate-700"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                  {studentName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-bold text-slate-900 leading-tight truncate max-w-[140px]">{studentName}</p>
                  <p className="text-[10px] text-slate-600 font-mono capitalize">{isAdmin ? 'Super Admin' : 'Student'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs animate-fade-in font-sans">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{studentName}</p>
                    <p className="text-slate-600 text-[11px] font-mono truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/dashboard?tab=courses"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>My Courses</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=assignments"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Assignments</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=certifications"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Certifications</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=support"
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Support & Doubts</span>
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="border-t border-slate-100 my-1" />
                      <Link
                        to="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-indigo-700 font-bold flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Super Admin Console</span>
                      </Link>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2"
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
