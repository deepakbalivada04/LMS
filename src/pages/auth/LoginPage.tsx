import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import loginBackdrop from '../../assets/login-backdrop.jpg';
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
  RefreshCw,
  Cpu,
  Bot,
  Code2,
  Sparkles
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
      {/* Subtle full-page ambient backdrop overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBackdrop})` }} 
      />
      <div className="absolute -left-20 top-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Dual-Column Auth Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CINEMATIC ROBOTICS & CODING IDE HERO BANNER  */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 relative p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden bg-slate-950 min-h-[540px]">
          {/* High-Resolution Maker Lab Backdrop */}
          <img 
            src={loginBackdrop} 
            alt="Robotics Lab Coding IDE and Hardware Kits"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-100 opacity-75"
          />

          {/* Aesthetic Multi-Layer Dark Gradient & Cyber-Maker Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-emerald-950/50 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />

          {/* Top Brand Logo & Floating Badges */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-emerald-400/30 shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                  Robo<span className="text-emerald-400">Academy</span>
                </span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <span>Hardware LMS & Web IDE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Physical Hardware Kits + Cloud Transcoding</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-3 text-white drop-shadow-sm">
              Build Real Robots.<br />
              Code Microcontrollers.
            </h2>
            <p className="text-xs text-slate-200 font-medium leading-relaxed mb-6 max-w-sm drop-shadow-sm">
              Hands-on ESP32 rover assembly, 6-DOF robotic arm kinematics, visual block coding, & live AWS video telemetry.
            </p>

            {/* Hardware Lab Tech Badges */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/60 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Physical Kit Curriculum</span>
                  <span className="text-xs font-bold text-white">ESP32 Rover & Robotic Arm</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/60 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Interactive Visual IDE</span>
                  <span className="text-xs font-bold text-white">Blockly + C++ Firmware Flashing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge & Telemetry */}
          <div className="pt-6 relative z-10 flex items-center justify-between border-t border-slate-800/80 mt-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Amazon Cognito Protected
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AWS Cloud Live
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
