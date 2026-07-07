import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Heart, Building, Eye, EyeOff, CheckCircle2, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 30;

export default function AuthSuite() {
  const { login, authMessage, clearAuthMessage } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isRegisterParam = searchParams.get('tab') === 'register';
  const roleParam = searchParams.get('role'); // 'donor' | 'ngo' | 'admin'

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState(roleParam || 'donor');
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp' | 'forgot' | 'reset'
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const passwordValue = watch('password');

  useEffect(() => {
    setIsRegister(isRegisterParam);
  }, [isRegisterParam]);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmitCredentials = (data) => {
    setAuthError('');
    setPendingCredentials(data);
    setLoading(true);

    // Simulated API authentication call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setOtpVal(['', '', '', '', '', '']);
      setOtpExpiresAt(Date.now() + OTP_EXPIRY_MS);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      toast.success('A 6-digit verification code has been dispatched to your email.');
    }, 1000);
  };

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

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otpVal.join('');

    if (enteredOtp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP.');
      return;
    }

    // Accept standard demo OTP: '123456'
    if (enteredOtp !== '123456') {
      setAuthError('Invalid verification code. Use preseeded code: 123456');
      toast.error('Verification code mismatch.');
      return;
    }

    setAuthError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const email = pendingCredentials?.email || `${selectedRole}@donatebridge.org`;
      const name = pendingCredentials?.name || '';
      
      login(selectedRole, email, name, { verificationStatus: 'approved' });
      
      if (selectedRole === 'admin') {
        navigate('/admin');
      } else if (selectedRole === 'ngo') {
        navigate('/ngo');
      } else {
        navigate('/donor');
      }
    }, 1000);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setAuthError('');
    setOtpVal(['', '', '', '', '', '']);
    setOtpExpiresAt(Date.now() + OTP_EXPIRY_MS);
    setResendCooldown(RESEND_COOLDOWN_SEC);
    toast.success('New 6-digit OTP code has been re-sent.');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Instructions have been sent to your email.');
      setStep('reset');
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password updated successfully.');
      setStep('credentials');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col lg:grid lg:grid-cols-2">
      {/* Left panel: Info & brand spotlight */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between p-12 bg-white border-r border-border min-h-screen">
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

      {/* Right panel: Wizard auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-premium-lg">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Credentials Form */}
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
                      : 'Please sign in with your preseeded role credentials.'}
                  </p>
                  {authMessage && (
                    <p className="text-xs text-red-500 bg-red-50 py-2 px-3 border border-red-100 rounded-lg">
                      {authMessage}
                    </p>
                  )}
                </div>

                {/* Role Switch Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('donor'); clearAuthMessage(); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      selectedRole === 'donor'
                        ? 'bg-white text-primary shadow-premium-sm font-bold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('ngo'); clearAuthMessage(); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      selectedRole === 'ngo'
                        ? 'bg-white text-primary shadow-premium-sm font-bold'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    NGO
                  </button>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => { setSelectedRole('admin'); clearAuthMessage(); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                        selectedRole === 'admin'
                          ? 'bg-white text-primary shadow-premium-sm font-bold'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Admin
                    </button>
                  )}
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
                        onClick={() => setStep('forgot')}
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
                    {isRegister ? 'Submit Registration' : 'Sign In'}
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

            {/* STEP 2: OTP View */}
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
                    We've emailed a verification OTP code. Use preseeded code <strong className="text-ink">123456</strong> for testing.
                  </p>
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
                      Verify Code
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
                    disabled={resendCooldown > 0}
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
                  <h1 className="text-xl font-display font-bold text-ink">Reset Password Instructions</h1>
                  <p className="text-xs text-slate-500">Provide your registered email and we'll dispatch password reset guidelines.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <InputField
                    label="Email Address"
                    id="forgot-email"
                    type="email"
                    placeholder="name@organization.org"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading}
                  >
                    Send Instructions
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
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
                  <p className="text-xs text-slate-500">Establish a secure password for your account.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <InputField
                    label="New Password"
                    id="new-pass"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  <InputField
                    label="Confirm New Password"
                    id="confirm-new-pass"
                    type="password"
                    placeholder="••••••••"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold"
                    disabled={loading}
                  >
                    Update Password
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
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
