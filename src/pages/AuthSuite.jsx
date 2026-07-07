import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, Heart, Building, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 45;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

export default function AuthSuite() {
  const { login, authMessage, clearAuthMessage } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isRegisterParam = searchParams.get('tab') === 'register';
  const roleParam = searchParams.get('role'); // 'donor' | 'ngo'

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState(roleParam || 'donor');
  const [step, setStep] = useState(roleParam ? 'credentials' : 'role-select'); // 'role-select' | 'credentials' | 'otp' | 'forgot' | 'reset'
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptTimestamps, setAttemptTimestamps] = useState([]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const passwordValue = watch('password');

  // Handle registration param sync
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
    const now = Date.now();
    const recentAttempts = attemptTimestamps.filter((ts) => now - ts < LOGIN_WINDOW_MS);
    if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      toast.error('Too many login attempts. Please wait 5 minutes and try again.');
      setAuthError('Too many attempts. Please wait a few minutes and try again.');
      return;
    }

    setAuthError('');
    setPendingCredentials(data);
    setAttemptTimestamps([...recentAttempts, now]);
    setLoading(true);

    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setOtpVal(['', '', '', '', '', '']);
      setOtpExpiresAt(Date.now() + OTP_EXPIRY_MS);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      toast.success('A 6-digit verification code has been dispatched to your email.');
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    // Auto-focus next input
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
    const now = Date.now();
    const enteredOtp = otpVal.join('');

    if (otpExpiresAt && now > otpExpiresAt) {
      setAuthError('This OTP has expired. Please resend and try again.');
      toast.error('The verification code has expired.');
      return;
    }

    if (enteredOtp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (enteredOtp !== '123456') {
      setAuthError('Invalid OTP. Please check the code and try again.');
      toast.error('Verification code mismatch.');
      return;
    }

    const enteredEmail = pendingCredentials?.email || `${selectedRole}@donatebridge.org`;
    const ngoVerification = selectedRole === 'ngo'
      ? JSON.parse(localStorage.getItem('ngoVerificationMap') || '{}')[enteredEmail]
      : null;

    setAuthError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(
        selectedRole,
        enteredEmail,
        pendingCredentials?.name || '',
        {
          verificationStatus: ngoVerification?.status || 'pending',
          rejectionReason: ngoVerification?.rejectionReason,
        }
      );
      if (selectedRole === 'donor') {
        navigate('/donor-dashboard');
      } else {
        navigate('/ngo-dashboard');
      }
    }, 1500);
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
      toast.success('Password reset instructions have been emailed to you.');
      setStep('reset');
    }, 1200);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Your password has been successfully updated.');
      setStep('credentials');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:grid lg:grid-cols-2 selection:bg-primary/20 selection:text-primary">
      {/* Left Panel: Trust & Welcome */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between p-12 min-h-screen bg-white border-r border-slate-200">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-all cursor-pointer w-fit font-medium group"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Welcome content */}
        <div className="space-y-8 max-w-md">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-premium-md shadow-primary/20">
              DB
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bridging Donors with NGOs.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              DonateBridge makes it simple and secure to donate physical items, track logistics in real-time, and support verified local NGOs.
            </p>
          </div>

          {/* Trust points */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">100% Verified Organizations</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">NGOs go through manual legal document verification before listing demands.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Strictly Non-Monetary</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">We focus exclusively on physical logistics and supply chains—zero cash donations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Tax Deductible Receipts</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Get digitally signed 501(c)(3) receipts as soon as NGOs confirm delivery logs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} DonateBridge. Dedicated to transparency.
        </p>
      </div>

      {/* Right Panel: Auth Suite */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen bg-slate-50">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Role Selection */}
            {step === 'role-select' && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Choose Account Type</h1>
                  <p className="text-sm text-slate-500">Select how you want to interact with DonateBridge.</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setSelectedRole('donor');
                      setStep('credentials');
                    }}
                    className="w-full p-5 text-left bg-white border border-slate-200 hover:border-primary rounded-xl shadow-premium-sm hover:shadow-premium-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Individual or Corporate Donor</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Donate clothes, medical equipment, tools, or supplies to local causes.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRole('ngo');
                      setStep('credentials');
                    }}
                    className="w-full p-5 text-left bg-white border border-slate-200 hover:border-primary rounded-xl shadow-premium-sm hover:shadow-premium-md transition-all duration-200 flex items-start gap-4 group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Nonprofit Organization (NGO)</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Register your verified authority to request specific supplies and manage logistics.</p>
                    </div>
                  </button>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => navigate('/')}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center gap-1.5 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Credentials Login / Registration */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm mx-auto shadow-premium-sm">
                    DB
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {isRegister ? 'Create Your Account' : 'Welcome Back'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {isRegister
                      ? 'Register to start matching and delivering supplies.'
                      : 'Sign in to access your dashboard.'}
                  </p>
                  {authMessage && (
                    <p className="text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-md border border-red-100" role="status">
                      {authMessage}
                    </p>
                  )}
                </div>

                {/* Role Tabs */}
                <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-lg border border-slate-200/40">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('donor')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                      selectedRole === 'donor'
                        ? 'bg-white text-primary shadow-premium-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ngo')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                      selectedRole === 'ngo'
                        ? 'bg-white text-primary shadow-premium-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    NGO Organization
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
                  {isRegister && (
                    <InputField
                      label={selectedRole === 'ngo' ? 'Organization Name' : 'Full Name'}
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
                    placeholder="name@organization.org"
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
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isRegister && (
                    <div className="flex justify-between items-center">
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
                    className="w-full"
                    disabled={loading}
                    aria-busy={loading}
                    onClick={clearAuthMessage}
                  >
                    {isRegister ? 'Request Verification Code' : 'Sign In with OTP'}
                  </Button>

                  {authError && (
                    <p className="text-xs text-red-600 font-semibold text-center" role="alert">{authError}</p>
                  )}
                </form>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                  <p className="text-center text-xs text-slate-500">
                    {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                    <button
                      type="button"
                      onClick={() => setIsRegister(!isRegister)}
                      className="text-primary hover:underline font-bold"
                    >
                      {isRegister ? 'Sign in' : 'Register'}
                    </button>
                  </p>

                  <button
                    onClick={() => setStep('role-select')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors mx-auto"
                  >
                    Change Account Type
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OTP Verification */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 bg-white border border-slate-200 rounded-xl p-6 shadow-premium-sm"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mx-auto border border-emerald-100">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Enter Verification Code</h2>
                  <p className="text-xs text-slate-500">We've dispatched a secure 6-digit OTP code to your inbox.</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {otpExpiresAt
                      ? `Expires in ${Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000))} seconds`
                      : ''}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
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
                        className="w-11 h-11 text-center text-lg font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors font-mono"
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                      aria-busy={loading}
                    >
                      Verify & Sign In
                    </Button>
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 font-semibold text-center" role="alert">{authError}</p>
                  )}
                </form>

                <p className="text-center text-xs text-slate-500">
                  Didn't receive the email?{' '}
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

            {/* STEP 4: Forgot Password */}
            {step === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password?</h1>
                  <p className="text-xs text-slate-500">Enter your email address and we'll send reset instructions.</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <InputField
                    label="Registered Email"
                    id="forgot-email"
                    type="email"
                    placeholder="name@organization.org"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    Send Reset Instructions
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full py-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors block text-center"
                  >
                    Back to Sign In
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 5: Reset Password */}
            {step === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
                  <p className="text-xs text-slate-500">Create a new secure password for your account.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <InputField
                    label="New Password"
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                  <InputField
                    label="Confirm New Password"
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    aria-busy={loading}
                  >
                    Save & Sign In
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="w-full py-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors block text-center"
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
