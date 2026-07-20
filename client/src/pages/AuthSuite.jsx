import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  // Steps: 'credentials' | 'register_otp' | 'forgot' | 'forgot_otp' | 'reset'
  const [step, setStep] = useState('credentials');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Registration state
  const [pendingRegData, setPendingRegData] = useState(null);
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const { register, handleSubmit, formState: { errors }, reset: resetForm } = useForm();

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  // Resend Timer countdown
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
        // Send OTP first
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
      // OTP Verified, now register
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
      redirectAfterLogin(user.role);
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
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col lg:justify-between p-12 bg-white border-r border-border h-full overflow-y-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="space-y-8 max-w-md my-auto">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">
              DB
            </div>
            <h2 className="text-3xl font-display font-bold text-ink leading-tight">
              A modern physical supply logistics framework.
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We connect local donors directly to vetted nonprofit organizations, coordinating route delivery logistics and certificates without middle agencies.
            </p>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-ink">Verified Nonprofits</h4>
                <p className="text-slate-500 mt-0.5">Strict admin audits of registration documentation prevent verification fraud.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-ink">Encrypted Verification Logs</h4>
                <p className="text-slate-500 mt-0.5">Secure logins ensure zero credential leakage or session hijacking risks.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} DonateBridge Inc. All rights reserved.
        </p>
      </div>

      <div className="flex-1 h-full overflow-y-auto bg-slate-50 flex flex-col justify-center py-8 px-6 sm:px-12 lg:px-20">
        <div className="w-full max-w-md mx-auto bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-premium-lg">
          <AnimatePresence mode="wait">
            
            {/* CREDENTIALS STEP */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-display font-bold text-ink">
                    {isRegister ? 'Create Your Account' : 'Welcome to DonateBridge'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {isRegister
                      ? 'Sign up to request or dispatch essential local goods.'
                      : 'Sign in with your registered credentials.'}
                  </p>
                  {authMessage && (
                    <p className="text-xs text-red-500 bg-red-50 py-2 px-3 border border-red-100 rounded-lg">
                      {authMessage}
                    </p>
                  )}
                </div>

                <div className="flex p-1 bg-slate-100 rounded-lg border border-border">
                  {['donor', 'ngo', ...(!isRegister ? ['admin'] : [])].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); clearAuthMessage(); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                        selectedRole === role
                          ? 'bg-white text-primary shadow-premium-sm font-bold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
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
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isRegister && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setStep('forgot'); setAuthError(''); }}
                        className="text-xs text-primary hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Processing…' : isRegister ? 'Continue' : 'Sign In'}
                  </Button>

                  {authError && (
                    <p className="text-xs text-red-500 font-semibold text-center mt-2">{authError}</p>
                  )}
                </form>

                <div className="pt-4 border-t border-border text-center text-xs text-slate-500">
                  {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
                    className="text-primary hover:underline font-bold"
                  >
                    {isRegister ? 'Sign in' : 'Register Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* OTP VERIFICATION STEP (Registration) */}
            {step === 'register_otp' && (
              <motion.div
                key="register_otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-xl font-display font-bold text-ink">Verify Your Email</h1>
                  <p className="text-xs text-slate-500">
                    We've sent a 6-digit code to <span className="font-semibold">{pendingRegData?.email}</span>.
                  </p>
                </div>
                <form onSubmit={handleRegisterOTP} className="space-y-4">
                  <InputField
                    label="6-Digit OTP Code"
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying…' : 'Verify & Create Account'}
                  </Button>
                  
                  {authError && <p className="text-xs text-red-500 font-semibold text-center">{authError}</p>}
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(pendingRegData?.email)}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs text-primary font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
                  >
                    Back
                  </button>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD STEP */}
            {step === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-xl font-display font-bold text-ink">Reset Password</h1>
                  <p className="text-xs text-slate-500">Enter your registered email to receive a reset OTP.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Send Reset OTP'}
                  </Button>

                  {authError && (
                    <p className="text-xs text-red-500 font-semibold text-center">{authError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
                  >
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD OTP STEP */}
            {step === 'forgot_otp' && (
              <motion.div
                key="forgot_otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-xl font-display font-bold text-ink">Verify OTP</h1>
                  <p className="text-xs text-slate-500">
                    We've sent a 6-digit code to <span className="font-semibold">{forgotEmail}</span>.
                  </p>
                </div>
                <form onSubmit={handleForgotOTP} className="space-y-4">
                  <InputField
                    label="6-Digit OTP Code"
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying…' : 'Verify Code'}
                  </Button>
                  
                  {authError && <p className="text-xs text-red-500 font-semibold text-center">{authError}</p>}
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(forgotEmail)}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs text-primary font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setAuthError(''); }}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-xl font-display font-bold text-ink">Set New Password</h1>
                  <p className="text-xs text-slate-500">Enter a strong new password for your account.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
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
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Updating…' : 'Update Password'}
                  </Button>

                  {authError && (
                    <p className="text-xs text-red-500 font-semibold text-center">{authError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors text-center"
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
