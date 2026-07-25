import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff, Sparkles, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { authAPI, getApiError } from '../api/index';

export default function AuthSuite() {
  const { loginWithTokens, authMessage, clearAuthMessage } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isRegisterParam = searchParams.get('tab') === 'register';
  const roleParam = searchParams.get('role');

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState(roleParam || 'donor');
  const [step, setStep] = useState('credentials');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [pendingRegData, setPendingRegData] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm();

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const redirectAfterLogin = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'ngo') navigate('/ngo');
    else navigate('/donor');
  };

  const startResendTimer = () => setResendTimer(30);

  const onSubmitCredentials = async (data) => {
    setAuthError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authAPI.sendOTP(data.email);
        setPendingRegData(data);
        setOtpCode('');
        setStep('register_otp');
        startResendTimer();
        toast.success('OTP sent to your email.');
      } else {
        const loginRes = await authAPI.login(data.email, data.password);
        const { user, access, refresh } = loginRes.data;
        loginWithTokens(user, access, refresh);
        clearAuthMessage();
        redirectAfterLogin(user.role);
      }
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      await authAPI.verifyOTP(pendingRegData.email, otpCode);
      const rawUsername = pendingRegData.name || pendingRegData.email.split('@')[0];
      const cleanUsername = rawUsername.replace(/[^a-zA-Z0-9@.+-_]/g, '') + Math.floor(Math.random() * 10000);
      const registerRes = await authAPI.register(
        cleanUsername, 
        pendingRegData.email, 
        pendingRegData.password, 
        selectedRole
      );
      const { user, access, refresh } = registerRes.data;
      loginWithTokens(user, access, refresh);
      toast.success('Account created! Welcome to DonateBridge.');
      if (user.role === 'ngo') {
        navigate('/ngo-register');
      } else {
        redirectAfterLogin(user.role);
      }
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (email) => {
    if (resendTimer > 0) return;
    setAuthError('');
    setLoading(true);
    try {
      await authAPI.sendOTP(email);
      startResendTimer();
      toast.success('OTP resent successfully.');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setAuthError('Email is required.'); return; }
    setLoading(true);
    setAuthError('');
    try {
      await authAPI.forgotPassword(forgotEmail);
      toast.success('OTP dispatched to your email.');
      setOtpCode('');
      startResendTimer();
      setStep('forgot_otp');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotOTP = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      await authAPI.verifyOTP(forgotEmail, otpCode);
      setStep('reset');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetPassword !== resetConfirm) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (resetPassword.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(forgotEmail, otpCode, resetPassword); 
      toast.success('Password updated successfully. Please sign in.');
      setStep('credentials');
      setIsRegister(false);
      resetForm();
      setAuthError('');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:grid lg:grid-cols-2 bg-slate-900 selection:bg-emerald-500/30">
      
      {/* LEFT SIDE - Brand Experience */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between p-12 h-full relative overflow-hidden">
        {/* Deep Glowing Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-slate-900 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] -right-[20%] w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-fit font-bold tracking-wide uppercase cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return Home
          </button>
        </div>

        <div className="space-y-10 max-w-lg my-auto relative z-10">
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-black text-white leading-[1.1] tracking-tight">
              A modern physical supply logistics framework.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-md">
              We connect local donors directly to vetted nonprofit organizations, coordinating route delivery logistics and certificates without middle agencies.
            </p>
          </div>

          <div className="space-y-6 pt-8 border-t border-slate-700/50">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Verified Nonprofits</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Strict admin audits of registration documentation prevent verification fraud.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-sm">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Encrypted Verification Logs</h4>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Secure logins ensure zero credential leakage or session hijacking risks.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} DonateBridge Inc.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Glassmorphic Form */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 relative flex flex-col justify-center py-10 px-4 sm:px-8 lg:px-20">
        
        {/* Subtle Form Background Pattern */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl z-0" />
        
        <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 relative z-10">
          <AnimatePresence mode="wait">
            
            {/* CREDENTIALS STEP */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-sm font-medium text-slate-500">
                    {isRegister
                      ? 'Sign up to request or dispatch essential local goods.'
                      : 'Sign in to your centralized dashboard.'}
                  </p>
                  {authMessage && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-bold bg-red-50 py-2.5 px-4 border border-red-100 rounded-xl mt-4">
                      {authMessage}
                    </motion.p>
                  )}
                </div>

                <div className="flex p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 backdrop-blur-sm">
                  {['donor', 'ngo'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); clearAuthMessage(); }}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize duration-300 ${
                        selectedRole === role
                          ? 'bg-white text-emerald-600 shadow-md shadow-slate-200/50'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
                  {isRegister && (
                    <InputField
                      label={selectedRole === 'ngo' ? 'Organization Legal Name' : 'Full Name'}
                      id="name"
                      placeholder={selectedRole === 'ngo' ? 'Hope Foundation' : 'Sarah Jenkins'}
                      error={errors.name}
                      {...register('name', { required: 'Name is required' })}
                    />
                  )}

                  <InputField
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder={`${selectedRole}@donatebridge.org`}
                    error={errors.email}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />

                  <div className="relative">
                    <InputField
                      label="Password"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      error={errors.password}
                      {...register('password', {
                        required: 'Password is required',
                        ...(isRegister && {
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-slate-400 hover:text-emerald-500 transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {!isRegister && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('forgot'); setAuthError(''); }}
                        className="text-sm text-emerald-600 hover:text-emerald-500 transition-colors font-bold"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-emerald-500/25 transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? 'Processing…' : isRegister ? 'Continue' : 'Sign In'}
                  </Button>

                  {authError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 font-bold text-center pt-2">
                      {authError}
                    </motion.p>
                  )}
                </form>

                <div className="pt-6 text-center text-sm font-medium text-slate-500">
                  {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
                    className="text-emerald-600 hover:text-emerald-500 font-bold transition-colors ml-1"
                  >
                    {isRegister ? 'Sign in' : 'Register Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* OTP VERIFICATION STEP */}
            {step === 'register_otp' && (
              <motion.div
                key="register_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                     <Lock className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-display font-black text-slate-900">Verify Email</h1>
                  <p className="text-sm font-medium text-slate-500">
                    We've sent a 6-digit code to<br/><span className="font-bold text-slate-700">{pendingRegData?.email}</span>
                  </p>
                </div>
                <form onSubmit={handleRegisterOTP} className="space-y-5">
                  <InputField
                    label="6-Digit Verification Code"
                    id="reg-otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying…' : 'Verify & Create Account'}
                  </Button>
                  
                  {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(pendingRegData?.email)}
                      disabled={resendTimer > 0 || loading}
                      className="text-sm text-emerald-600 font-bold hover:text-emerald-500 transition-colors disabled:opacity-50 disabled:hover:text-emerald-600"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 mt-4 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Return to Login
                  </button>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD STEP */}
            {step === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                     <ShieldCheck className="w-8 h-8 text-slate-400" />
                  </div>
                  <h1 className="text-2xl font-display font-black text-slate-900">Reset Password</h1>
                  <p className="text-sm font-medium text-slate-500">Enter your email to receive a recovery code.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <InputField
                    label="Email Address"
                    id="forgot-email"
                    type="email"
                    placeholder="name@organization.org"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Send Recovery Code'}
                  </Button>

                  {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 mt-4 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Cancel & Return
                  </button>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD OTP STEP */}
            {step === 'forgot_otp' && (
              <motion.div
                key="forgot_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-2xl font-display font-black text-slate-900">Verify OTP</h1>
                  <p className="text-sm font-medium text-slate-500">
                    Recovery code sent to <span className="font-bold text-slate-700">{forgotEmail}</span>.
                  </p>
                </div>
                <form onSubmit={handleForgotOTP} className="space-y-5">
                  <InputField
                    label="6-Digit Recovery Code"
                    id="forgot-otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </Button>
                  
                  {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(forgotEmail)}
                      disabled={resendTimer > 0 || loading}
                      className="text-sm text-emerald-600 font-bold hover:text-emerald-500 transition-colors disabled:opacity-50"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setAuthError(''); }}
                    className="w-full py-2 mt-4 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Back
                  </button>
                </form>
              </motion.div>
            )}

            {/* RESET PASSWORD STEP */}
            {step === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-2xl font-display font-black text-slate-900">Set New Password</h1>
                  <p className="text-sm font-medium text-slate-500">Enter a strong new password for your account.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <InputField
                    label="New Password"
                    id="new-pass"
                    type="password"
                    placeholder="••••••••"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    required
                  />
                  <InputField
                    label="Confirm New Password"
                    id="confirm-new-pass"
                    type="password"
                    placeholder="••••••••"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? 'Updating…' : 'Update Password'}
                  </Button>

                  {authError && <p className="text-xs text-red-500 font-bold text-center">{authError}</p>}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 mt-4 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
