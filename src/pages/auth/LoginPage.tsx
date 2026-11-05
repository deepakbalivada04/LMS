import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import loginBackdrop from '../../assets/login-backdrop.jpg';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  Cpu, 
  Bot, 
  Code2, 
  Sparkles,
  Award,
  Layers
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* FULL-PAGE IMMERSIVE REALISTIC ROBOTICS LAB BACKDROP       */}
      {/* ========================================================= */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat scale-100 transition-all duration-1000"
        style={{ backgroundImage: `url(${loginBackdrop})` }}
      />

      {/* Atmospheric Soft Dark Gradient Overlay to ensure full visibility and high contrast */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/60 to-slate-900/70 backdrop-blur-[2px]" />

      {/* Ambient subtle glow lights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================= */}
      {/* MAIN DUAL-COLUMN AUTHENTIC AUTH CARD                      */}
      {/* ========================================================= */}
      <div className="w-full max-w-5xl bg-slate-950/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 text-white">
        
        {/* ======================================================= */}
        {/* LEFT COLUMN: HERO SHOWCASE (CHILDREN IN ROBOTICS LAB)   */}
        {/* ======================================================= */}
        <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[560px] border-b lg:border-b-0 lg:border-r border-white/10">
          
          {/* Subtle inside background preview */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-110"
            style={{ backgroundImage: `url(${loginBackdrop})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-indigo-950/40" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white block leading-none">
                  Robo<span className="text-cyan-400">LMS</span>
                </span>
                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-mono font-bold mt-1 block">
                  Robotics & AI Academy
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grades 3–10 Hands-on Robotics & STEM</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3 text-white">
              Build Real Robots.<br />
              Code from Day One.
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
              Join young innovators building multi-axis robotic arms, programming autonomous obstacle-avoidance rovers, and learning embedded sensor wiring with friendly visual block coding.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Robotic Arm & Rover Kits</h5>
                  <p className="text-[10px] text-slate-400">Hands-on assembly with ESP32 & TT motors</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Visual Block Coding & C++</h5>
                  <p className="text-[10px] text-slate-400">Learn algorithms with live hardware feedback</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Certified Hardware Mastery</h5>
                  <p className="text-[10px] text-slate-400">Earn verified diplomas upon lab completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="pt-6 relative z-10 flex items-center justify-between border-t border-white/10 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              AWS Cloud Live
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              Cognito Secured
            </span>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: CLEAN STUDENT SIGN IN / REGISTER FORM     */}
        {/* ======================================================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white text-slate-900">
          
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'signin' && 'Welcome Back, Innovator!'}
              {mode === 'signup' && 'Create Student Account'}
              {mode === 'confirm' && 'Verify Your Email'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin' && 'Sign in with your registered email to access your hardware workbench.'}
              {mode === 'signup' && 'Register your student passport to begin hands-on robotics courses.'}
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
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-2.5 rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student / Admin Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@example.com or sannathkoushik@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Learning Bench</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password (Min 8 chars, 1 number, 1 uppercase)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Confirm Code Form */}
          {mode === 'confirm' && (
            <form onSubmit={handleConfirmCode} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 text-center text-lg font-mono tracking-widest font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <span>Verifying...</span> : <span>Confirm & Sign In</span>}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Resend verification code
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-slate-500 font-bold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Commercial LMS Access Protected</span>
            <span className="font-mono text-slate-500">v2.4 &bull; 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
};
