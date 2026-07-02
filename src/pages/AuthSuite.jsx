import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/GlobalStateContext';
import { ShieldCheck, Heart, Info, ArrowLeft, KeyRound, Mail, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';

export default function AuthSuite() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegisterParam = searchParams.get('register') === 'true';

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [selectedRole, setSelectedRole] = useState('donor'); // 'donor' | 'ngo'
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmitCredentials = (data) => {
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate successful login
      login(selectedRole, `${selectedRole}@donatebridge.org`);
      if (selectedRole === 'donor') {
        navigate('/donor-dashboard');
      } else {
        navigate('/ngo-dashboard');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col md:grid md:grid-cols-2">
      {/* Left Block: Marketing / Trust Statements */}
      <div className="bg-slate-900 text-white p-8 md:p-16 flex flex-col justify-between min-h-[300px] md:min-h-screen relative overflow-hidden">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg my-auto pt-8 md:pt-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Heart className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Connecting Verifiable Physical Resources
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Donate Bridge strictly enforces logistics verification, cargo auditing, and non-monetary operations. Join our network to connect clothing, essential medical supplies, school books, and food bundles directly to local distribution agencies.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">NGO Authentication Audits</p>
                <p className="text-slate-400 text-[11px]">All NGO accounts require verification documents before accessing matching maps.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Strict Item Policies</p>
                <p className="text-slate-400 text-[11px]">Money, capital exchanges, and advertising items are strictly prohibited on the platform.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 flex justify-between items-center border-t border-slate-800/80 pt-6">
          <span>Donate Bridge Trust Network &copy; {new Date().getFullYear()}</span>
          <span>v2.4.1 Stable</span>
        </div>
      </div>

      {/* Right Block: Onboarding Portal */}
      <div className="p-6 sm:p-12 md:p-16 lg:p-24 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRegister ? 'Join as a physical item donor or a registered NGO.' : 'Enter your details to manage shipments and matching logs.'}
            </p>
          </div>

          {step === 'credentials' && (
            <div className="space-y-6">
              {/* Twin Cards: Split Donor registration from NGO */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('donor')}
                  className={`p-4 rounded-md border text-center transition-all duration-300 ${
                    selectedRole === 'donor'
                      ? 'border-primary bg-emerald-50/50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 ring-2 ring-primary'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-2 text-slate-500" />
                  <span className="text-xs font-bold block">Donor Account</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Individual / Corporate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('ngo')}
                  className={`p-4 rounded-md border text-center transition-all duration-300 ${
                    selectedRole === 'ngo'
                      ? 'border-primary bg-emerald-50/50 dark:bg-emerald-950/20 text-primary dark:text-emerald-450 ring-2 ring-primary'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto mb-2 text-slate-500" />
                  <span className="text-xs font-bold block">NGO Organization</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Verified Institutions</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit(onSubmitCredentials)} className="space-y-4">
                {isRegister && (
                  <InputField
                    label="Full Name / Organization Name"
                    id="name"
                    placeholder={selectedRole === 'ngo' ? 'Hope Foundation Inc.' : 'Sarah Jenkins'}
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

                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  {isRegister ? 'Request Verification Code' : 'Sign In with OTP'}
                </Button>
              </form>

              <div className="text-center text-xs">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-primary hover:underline font-semibold"
                >
                  {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <Card className="p-6 border border-slate-200 dark:border-slate-800">
              <div className="space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold">Verification Code Sent</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please enter the 6-digit verification code sent to your email to authenticate your role.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Digits Inputs */}
                  <div className="flex justify-center gap-2">
                    {otpVal.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-12 text-center text-lg font-bold rounded border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-slate-100"
                      />
                    ))}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                      Verify & Log In
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setStep('credentials')}>
                      Go Back
                    </Button>
                  </div>
                </form>

                <p className="text-[10px] text-slate-400">
                  Didn't receive the email? Check spam filters or{' '}
                  <button type="button" className="text-primary hover:underline font-semibold">
                    Resend Code
                  </button>
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
