import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { ShieldCheck, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/InputField';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 45;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

export default function AuthSuite() {
  const { login, authMessage, clearAuthMessage } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('register') === 'true';

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState('donor'); // 'donor' | 'ngo'
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptTimestamps, setAttemptTimestamps] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

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
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpVal];
    newOtp[index] = value.substring(value.length - 1);
    setOtpVal(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpVal[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const now = Date.now();
    const enteredOtp = otpVal.join('');

    if (otpExpiresAt && now > otpExpiresAt) {
      setAuthError('This OTP has expired. Please resend and try again.');
      return;
    }

    if (enteredOtp.length !== 6) {
      setAuthError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (enteredOtp !== '123456') {
      setAuthError('Invalid OTP. Please check the code and try again.');
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
      // Simulate successful login
      login(
        selectedRole,
        enteredEmail,
        pendingCredentials?.name || '',
        {
          verificationStatus: ngoVerification?.status,
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Panel: Trust & Welcome */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between p-12 min-h-screen bg-white border-r border-slate-200">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer w-fit"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Welcome content */}
        <div className="space-y-8 max-w-md">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Welcome to DonateBridge
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Join a community helping verified NGOs through transparent item donations.
            </p>
          </div>

          {/* Trust points */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Verified NGOs only</span>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">No cash donations</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Secure donor and NGO accounts</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} DonateBridge. All rights reserved.
        </p>
      </div>

      {/* Right Panel: Auth Card */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 min-h-screen bg-slate-50">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo & heading */}
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm mx-auto">
              DB
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-500">
              {isRegister
                ? 'Join DonateBridge and make meaningful donations.'
                : 'Sign in to continue helping verified NGOs.'}
            </p>
            {authMessage && (
              <p className="text-xs text-red-600" role="status">
                {authMessage}
              </p>
            )}
          </div>

          {step === 'credentials' && (
            <div className="space-y-5">
              {/* Role tabs */}
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                    selectedRole === 'donor'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Switch to donor account"
                  aria-pressed={selectedRole === 'donor'}
                >
                  Donor
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                    selectedRole === 'ngo'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Switch to NGO account"
                  aria-pressed={selectedRole === 'ngo'}
                >
                  NGO
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-5">
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
                  placeholder="you@organization.org"
                  error={errors.email}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <InputField
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />

                {!isRegister && (
                  <button
                    type="button"
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Forgot your password?
                  </button>
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
                  <p className="text-xs text-red-600 font-medium" role="alert">{authError}</p>
                )}
              </form>

              {/* Switch auth mode */}
              <p className="text-center text-sm text-slate-500">
                {isRegister ? "Already have an account? " : "Don't have an account yet? "}
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {isRegister ? 'Sign in' : 'Register'}
                </button>
              </p>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-5 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Verification Code Sent
                </h3>
                <p className="text-sm text-slate-500">
                  Enter the 6-digit code sent to your email to complete sign in.
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {otpExpiresAt
                    ? `Code expires in ${Math.max(0, Math.ceil((otpExpiresAt - Date.now()) / 1000))}s`
                    : 'Code expires in 600s'}
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* OTP inputs */}
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
                      className="w-12 h-12 text-center text-lg font-semibold rounded-md bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      aria-label={`OTP digit ${index + 1}`}
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
                    className="w-full py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Go Back
                  </button>
                </div>

                {authError && (
                  <p className="text-xs text-red-600 font-medium text-center" role="alert">{authError}</p>
                )}
              </form>

              <p className="text-center text-xs text-slate-500">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
