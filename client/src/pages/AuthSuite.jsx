import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ArrowLeft, Eye, EyeOff, Sparkles, Activity, CheckCircle2, Truck } from 'lucide-react';
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
        toast.success('Verification OTP sent to your email.');
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
      toast.success('Recovery code sent to your email.');
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
    <div className="min-h-screen w-screen flex flex-col lg:grid lg:grid-cols-12 bg-[#F8FAFC]">
      
      {/* LEFT SIDE - Brand Experience Banner */}
      <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1E13] via-[#143320] to-[#0A1A11] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden min-h-[300px] lg:min-h-screen text-left">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#4A7C59]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Back Navigation Button */}
        <div className="relative z-10">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </button>
        </div>

        {/* Main Brand Messaging */}
        <div className="relative z-10 space-y-8 max-w-lg my-auto py-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3EC] text-[#4A7C59] font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Secure Logistics Portal
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Connecting Donors &amp; NGOs with Transparency.
            </h1>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
              Direct physical supply logistics, zero middle-agency escrow leakage, real-time tracking, and instant 80G tax invoice generation.
            </p>
          </div>

          {/* High-Contrast Feature Highlights */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-[#4A7C59]">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Verified Nonprofit Network</h4>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  Strict admin audits of registration documentation prevent verification fraud.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-[#4A7C59]">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Encrypted Authentication</h4>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  Role-based permissions ensure maximum security and zero credential leakage.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-[#4A7C59]">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Direct Route Dispatches</h4>
                <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">
                  Coordinate physical logistics seamlessly with vetted couriers and hub pickup points.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs font-medium text-stone-400">
          &copy; {new Date().getFullYear()} DonateBridge Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - Authentication Form Card */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 bg-[#F8FAFC]">
        
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-xl text-left space-y-6">
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
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                    {isRegister ? 'Create an Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-stone-500 font-medium">
                    {isRegister
                      ? 'Register to dispatch supplies or request NGO assistance.'
                      : 'Sign in to access your dispatch dashboard.'}
                  </p>
                  {authMessage && (
                    <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 border border-rose-200 rounded-xl mt-3">
                      {authMessage}
                    </p>
                  )}
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200">
                  {['donor', 'ngo'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); clearAuthMessage(); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                        selectedRole === role
                          ? 'bg-[#4A7C59] text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {role === 'donor' ? 'Donor Account' : 'NGO Organization'}
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
                        ...(isRegister && {
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[34px] text-stone-400 hover:text-[#4A7C59] transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {!isRegister && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep('forgot'); setAuthError(''); }}
                        className="text-xs text-[#4A7C59] hover:underline font-bold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-[#4A7C59] hover:bg-[#3B6647] text-white font-bold py-3 px-4 rounded-xl shadow-xs text-sm transition-all cursor-pointer mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : isRegister ? 'Continue to Verification' : 'Sign In'}
                  </Button>

                  {authError && (
                    <p className="text-xs text-rose-600 font-bold text-center pt-2">
                      {authError}
                    </p>
                  )}
                </form>

                <div className="pt-4 border-t border-stone-100 text-center text-xs font-medium text-stone-500">
                  {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setAuthError(''); }}
                    className="text-[#4A7C59] hover:underline font-bold cursor-pointer ml-1"
                  >
                    {isRegister ? 'Sign in' : 'Register Now'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* REGISTER OTP STEP */}
            {step === 'register_otp' && (
              <motion.div
                key="register_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-[#E8F3EC] text-[#4A7C59] rounded-full flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">Verify Email</h2>
                  <p className="text-xs text-stone-500 font-medium">
                    We've sent a 6-digit OTP code to<br/><span className="font-bold text-stone-800">{pendingRegData?.email}</span>
                  </p>
                </div>

                <form onSubmit={handleRegisterOTP} className="space-y-4">
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
                    className="w-full bg-[#4A7C59] hover:bg-[#3B6647] text-white font-bold py-3 rounded-xl text-sm shadow-xs"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </Button>
                  
                  {authError && <p className="text-xs text-rose-600 font-bold text-center">{authError}</p>}
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(pendingRegData?.email)}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs text-[#4A7C59] font-bold hover:underline disabled:opacity-50"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-[#E8F3EC] text-[#4A7C59] rounded-full flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">Reset Password</h2>
                  <p className="text-xs text-stone-500 font-medium">Enter your account email to receive a recovery code.</p>
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
                    className="w-full bg-[#4A7C59] hover:bg-[#3B6647] text-white font-bold py-3 rounded-xl text-sm shadow-xs"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Recovery Code'}
                  </Button>

                  {authError && <p className="text-xs text-rose-600 font-bold text-center">{authError}</p>}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
                  >
                    Cancel &amp; Return
                  </button>
                </form>
              </motion.div>
            )}

            {/* FORGOT OTP STEP */}
            {step === 'forgot_otp' && (
              <motion.div
                key="forgot_otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-stone-900">Verify OTP</h2>
                  <p className="text-xs text-stone-500 font-medium">
                    Recovery code sent to <span className="font-bold text-stone-800">{forgotEmail}</span>.
                  </p>
                </div>

                <form onSubmit={handleForgotOTP} className="space-y-4">
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
                    className="w-full bg-[#4A7C59] hover:bg-[#3B6647] text-white font-bold py-3 rounded-xl text-sm shadow-xs"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  
                  {authError && <p className="text-xs text-rose-600 font-bold text-center">{authError}</p>}
                  
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => handleResendOTP(forgotEmail)}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs text-[#4A7C59] font-bold hover:underline disabled:opacity-50"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setAuthError(''); }}
                    className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
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
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-stone-900">Set New Password</h2>
                  <p className="text-xs text-stone-500 font-medium">Enter a strong new password for your account.</p>
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
                    className="w-full bg-[#4A7C59] hover:bg-[#3B6647] text-white font-bold py-3 rounded-xl text-sm shadow-xs"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>

                  {authError && <p className="text-xs text-rose-600 font-bold text-center">{authError}</p>}

                  <button
                    type="button"
                    onClick={() => { setStep('credentials'); setAuthError(''); }}
                    className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800"
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
