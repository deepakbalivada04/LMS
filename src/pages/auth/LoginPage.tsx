import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Users,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'confirm';

export const LoginPage: React.FC = () => {
  const { login, register, confirmRegistration, resendCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.message || 'Failed to authenticate.';
      if (err?.name === 'UserNotConfirmedException' || msg.includes('confirm')) {
        setMode('confirm');
        setSuccessMessage('Please verify your email address to complete registration.');
      } else if (err?.name === 'NotAuthorizedException' || msg.includes('Incorrect')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Pure student registration
      const result = await register({ email, password, name, role: 'student' });
      if (result.isSignUpComplete) {
        setSuccessMessage('Account created successfully! You can now sign in.');
        setMode('signin');
      } else {
        setSuccessMessage('A 6-digit confirmation code was sent to your email.');
        setMode('confirm');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Check password requirements.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await confirmRegistration(email, verificationCode);
      setSuccessMessage('Email verified successfully! You can now sign in.');
      setMode('signin');
    } catch (err: any) {
      setError(err?.message || 'Invalid confirmation code. Please check your inbox.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendCode(email);
      setSuccessMessage('A new verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err?.message || 'Could not resend code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Decorative ambient yellow/amber blur accents matching dashboard */}
      <div className="absolute -left-20 top-20 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Column Auth Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* ========================================================= */}
        {/* LEFT COLUMN: BRAND TEAL BANNER (MATCHING THE DASHBOARD)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#2bb398] via-[#24a58b] to-[#1e967d] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                  Robo<span className="text-emerald-200">Academy</span>
                </span>
                <span className="text-[10px] text-emerald-100 uppercase tracking-widest font-semibold">
                  Hardware & Robotics LMS
                </span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-3">
              Learn With Effectively With Us!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed mb-6">
              Hands-on hardware labs, ESP32 microcontrollers, 6-DOF kinematics, & AWS Cloud telemetry.
            </p>

            {/* Stat Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 w-fit">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-100 block font-medium">Active Students</span>
                  <span className="text-xs font-bold text-white">75,000+ Enrolled</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 w-fit">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-100 block font-medium">Expert Mentors</span>
                  <span className="text-xs font-bold text-white">200+ Instructors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge & Graphic */}
          <div className="pt-8 relative z-10 flex items-center justify-between border-t border-white/20 mt-6">
            <span className="text-xs text-emerald-100 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              Amazon Cognito Protected
            </span>
            <div className="flex items-end gap-1 text-3xl select-none">
              <span>👨‍🎓</span>
              <span>👩‍🎓</span>
              <span>🧑‍🎓</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PURE STUDENT SIGN IN / REGISTRATION FORM     */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Student Account'}
              {mode === 'confirm' && 'Verify Your Email'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'signin' && 'Log in with your verified email to access your robotics workbench.'}
              {mode === 'signup' && 'Register your student passport to begin hands-on microcontroller courses.'}
              {mode === 'confirm' && `Enter the 6-digit verification code sent to ${email}`}
            </p>
          </div>

          {/* Tabs: Sign In vs Create Account */}
          {mode !== 'confirm' && (
            <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-slate-100 text-xs font-bold select-none">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* FORM: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Learning Bench</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM: CREATE ACCOUNT */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* FORM: CONFIRM EMAIL VERIFICATION CODE */}
          {mode === 'confirm' && (
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-sky-600 placeholder-slate-300 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/20"
              >
                {isLoading ? 'Verifying with Cognito...' : 'Verify Email & Enter Workbench'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
