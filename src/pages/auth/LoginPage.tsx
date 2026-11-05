import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import loginBackdrop from '../../assets/login-backdrop.jpg';
import companyLogo from '../../assets/text_logo.png';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  KeyRound,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'confirm' | 'forgot_request' | 'forgot_confirm';

export const LoginPage: React.FC = () => {
  const { 
    login, 
    register, 
    confirmRegistration, 
    resendCode, 
    forgotPassword, 
    confirmForgotPassword 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
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
    clearMessages();
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
    clearMessages();
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

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your account email.');
      return;
    }
    clearMessages();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSuccessMessage(`A password reset code has been sent to ${email}`);
      setMode('forgot_confirm');
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset. Check if email is registered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      await confirmForgotPassword(email, verificationCode, newPassword);
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
      setMode('signin');
      setPassword('');
      setNewPassword('');
      setVerificationCode('');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please verify the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    clearMessages();
    try {
      await resendCode(email);
      setSuccessMessage('A new verification code has been dispatched to your email.');
    } catch (err: any) {
      setError(err?.message || 'Could not resend code.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      
      {/* ========================================================= */}
      {/* REALISTIC ROBOTICS MAKERSPACE CLASSROOM BACKGROUND        */}
      {/* ========================================================= */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBackdrop})` }}
      />

      {/* Gentle Atmospheric Overlay so children working on robotics are clearly visible */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1.5px]" />

      {/* ========================================================= */}
      {/* SINGLE CLEAN AUTHENTICATION CARD                          */}
      {/* ========================================================= */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 sm:p-10 relative z-10 text-slate-900 transition-all">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <img 
            src={companyLogo} 
            alt="Flynbrd Logo" 
            className="h-16 sm:h-20 max-w-[240px] w-auto object-contain mx-auto mb-3 hover:scale-105 transition-transform"
          />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            Hands-on Robotics & AI Learning Bench
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        {(mode === 'signin' || mode === 'signup') && (
          <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-slate-100 text-xs font-bold select-none">
            <button
              type="button"
              onClick={() => { setMode('signin'); clearMessages(); }}
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
              onClick={() => { setMode('signup'); clearMessages(); }}
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

        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: SIGN IN FORM                                      */}
        {/* ========================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
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
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot_request'); clearMessages(); }}
                  className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
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
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Learning Bench</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CREATE STUDENT ACCOUNT                            */}
        {/* ========================================================= */}
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
              <label className="font-bold text-slate-700 block mb-1">Email</label>
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
              <label className="font-bold text-slate-700 block mb-1">
                Password (Min 8 chars, 1 uppercase, 1 number)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create password"
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
              {isLoading ? <span>Registering...</span> : <span>Create Student Account</span>}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: FORGOT PASSWORD (STEP 1: REQUEST CODE)             */}
        {/* ========================================================= */}
        {mode === 'forgot_request' && (
          <form onSubmit={handleForgotRequest} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); clearMessages(); }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h4 className="font-extrabold text-sm text-slate-900">Reset Your Password</h4>
            </div>
            
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Enter the email address registered with your account. We will send you a 6-digit verification code to reset your password.
            </p>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <span>Sending Code...</span> : <span>Send Reset Code</span>}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); clearMessages(); }}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: FORGOT PASSWORD (STEP 2: CONFIRM NEW PASSWORD)     */}
        {/* ========================================================= */}
        {mode === 'forgot_confirm' && (
          <form onSubmit={handleForgotConfirm} className="space-y-4 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => { setMode('forgot_request'); clearMessages(); }}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h4 className="font-extrabold text-sm text-slate-900">Enter Reset Code</h4>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">6-Digit Reset Code</label>
              <input
                type="text"
                required
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-center font-mono text-base font-bold tracking-widest focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 font-medium"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
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
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <span>Updating Password...</span> : <span>Reset Password & Sign In</span>}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: EMAIL CONFIRMATION CODE                            */}
        {/* ========================================================= */}
        {mode === 'confirm' && (
          <form onSubmit={handleConfirmCode} className="space-y-4 text-xs">
            <h4 className="font-extrabold text-sm text-slate-900">Verify Your Email</h4>
            <p className="text-slate-500 text-[11px]">
              Enter the 6-digit confirmation code dispatched to <strong>{email}</strong>
            </p>

            <div>
              <input
                type="text"
                required
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <span>Verifying...</span> : <span>Confirm & Activate Account</span>}
            </button>

            <div className="flex items-center justify-between pt-2 text-[11px]">
              <button
                type="button"
                onClick={handleResend}
                className="text-indigo-600 font-bold hover:underline"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setMode('signin'); clearMessages(); }}
                className="text-slate-500 font-bold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
