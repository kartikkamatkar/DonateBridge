import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';
import { authAPI, getApiError } from '../api/index';

const RESEND_COOLDOWN_SEC = 30;

export default function AuthSuite() {
  const { loginWithTokens, authMessage, clearAuthMessage } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isRegisterParam = searchParams.get('tab') === 'register';
  const roleParam = searchParams.get('role');

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState(roleParam || 'donor');
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp' | 'forgot' | 'reset'
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingCredentials, setPendingCredentials] = useState(null); // for OTP verify
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpPreview, setOtpPreview] = useState(''); // shown in dev mode from API response
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  useEffect(() => {
    if (isRegister && selectedRole === 'ngo') {
      navigate('/ngo-register');
    }
  }, [isRegister, selectedRole, navigate]);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const redirectAfterLogin = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'ngo') navigate('/ngo');
    else navigate('/donor');
  };

  // ─── Step 1: Submit Credentials ───
  const onSubmitCredentials = async (data) => {
    setAuthError('');
    setLoading(true);

    try {
      if (isRegister) {
        // REGISTER: create account, then send OTP
        const username = data.name || data.email.split('@')[0];
        await authAPI.register(username, data.email, data.password, selectedRole);
        // After register, send OTP for verification
        const otpRes = await authAPI.sendOTP(data.email);
        setOtpPreview(otpRes.data?.otp_preview || '');
        setPendingEmail(data.email);
        setPendingCredentials(data);
        setStep('otp');
        setOtpVal(['', '', '', '', '', '']);
        setResendCooldown(RESEND_COOLDOWN_SEC);
        toast.success('Account created! Check your email for the verification code.');
      } else {
        // LOGIN: call login API → if successful, go to OTP step
        await authAPI.sendOTP(data.email);
        setPendingEmail(data.email);
        setPendingCredentials(data);
        setStep('otp');
        setOtpVal(['', '', '', '', '', '']);
        setResendCooldown(RESEND_COOLDOWN_SEC);
        toast.success('A 6-digit verification code has been dispatched to your email.');
      }
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Handlers ───
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpVal[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // ─── Step 2: Verify OTP → Complete Login ───
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otpVal.join('');
    if (enteredOtp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setAuthError('');
    setLoading(true);

    try {
      // Verify OTP with backend
      await authAPI.verifyOTP(pendingEmail, enteredOtp);

      if (isRegister) {
        // Registration flow: send OTP was just for email verification; now auto-login
        const loginRes = await authAPI.login(pendingEmail, pendingCredentials.password);
        const { user, access, refresh } = loginRes.data;
        loginWithTokens(user, access, refresh);
        toast.success(`Account verified! Welcome to DonateBridge.`);
        redirectAfterLogin(user.role);
      } else {
        // Login flow: verify then login
        const loginRes = await authAPI.login(pendingEmail, pendingCredentials.password);
        const { user, access, refresh } = loginRes.data;
        loginWithTokens(user, access, refresh);
        clearAuthMessage();
        redirectAfterLogin(user.role);
      }
    } catch (err) {
      setAuthError(getApiError(err));
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError('');
    setLoading(true);
    try {
      const res = await authAPI.sendOTP(pendingEmail);
      setOtpPreview(res.data?.otp_preview || '');
      setOtpVal(['', '', '', '', '', '']);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      toast.success('New OTP code dispatched to your email.');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password ───
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { setAuthError('Email is required.'); return; }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(forgotEmail);
      setOtpPreview(res.data?.otp_preview || '');
      toast.success('Password reset code dispatched to your email.');
      setStep('reset');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── Reset Password ───
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
      await authAPI.resetPassword(forgotEmail, resetCode, resetPassword);
      toast.success('Password updated successfully. Please sign in.');
      setStep('credentials');
      setAuthError('');
    } catch (err) {
      setAuthError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-900 flex flex-col lg:grid lg:grid-cols-2">
      {/* Left panel */}
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
                <p className="text-slate-500 mt-0.5">OTP logins ensure zero credential leakage or session hijacking risks.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} DonateBridge Inc. All rights reserved.
        </p>
      </div>

      {/* Right panel: Auth form */}
      <div className="flex-1 h-full overflow-y-auto bg-slate-50 flex flex-col justify-center py-8 px-6 sm:px-12 lg:px-20">
        <div className="w-full max-w-md mx-auto bg-white border border-border rounded-2xl p-6 sm:p-8 shadow-premium-lg">
          <AnimatePresence mode="wait">

            {/* STEP 1: Credentials */}
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

                {/* Role Tabs */}
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
                    {loading ? 'Processing…' : isRegister ? 'Create Account' : 'Sign In'}
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

            {/* STEP 2: OTP */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-primary">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-display font-bold text-ink">Two-Factor OTP Security</h2>
                  <p className="text-xs text-slate-500">
                    We've emailed a 6-digit code to <strong className="text-ink">{pendingEmail}</strong>.
                  </p>
                  {otpPreview && (
                    <p className="text-xs text-amber-600 bg-amber-50 py-1.5 px-3 border border-amber-100 rounded-lg font-mono">
                      🔑 Dev Preview Code: <strong>{otpPreview}</strong>
                    </p>
                  )}
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {otpVal.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-mono"
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                      disabled={loading}
                    >
                      {loading ? 'Verifying…' : 'Verify Code'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-500 font-semibold text-center">{authError}</p>
                  )}
                </form>

                <p className="text-center text-xs text-slate-500">
                  Didn't receive email code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-primary hover:underline font-bold disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </p>
              </motion.div>
            )}

            {/* STEP 3: Forgot Password */}
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
                  <p className="text-xs text-slate-500">Enter your registered email to receive a reset code.</p>
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
                    {loading ? 'Sending…' : 'Send Reset Code'}
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

            {/* STEP 4: Reset Password */}
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
                  <p className="text-xs text-slate-500">Enter the reset code from your email and a new password.</p>
                  {otpPreview && (
                    <p className="text-xs text-amber-600 bg-amber-50 py-1.5 px-3 border border-amber-100 rounded-lg font-mono">
                      🔑 Dev Reset Code: <strong>{otpPreview}</strong>
                    </p>
                  )}
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <InputField
                    label="Reset Code (6-digit)"
                    id="reset-code"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
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
