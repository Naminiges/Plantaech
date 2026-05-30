import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiEyeLine, RiEyeOffLine, RiMailSendLine, RiShieldKeyholeLine, RiLockPasswordLine, RiArrowLeftLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { authService } from '../services';
import logo from '../assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const OTP_LENGTH = 6;

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Wizard state: 'email' → 'otp' → 'password'
  const [step, setStep] = useState('email');

  // Step 1: Email
  const [email, setEmail] = useState('');

  // Step 2: OTP
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef([]);
  const [countdown, setCountdown] = useState(0);

  // Step 3: Password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // ── Step 1: Request OTP ───────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) { setErrors({ email: 'Email is required' }); return; }
    setLoading(true);
    setErrors({});
    try {
      await authService.requestOtp(email);
      toast.success('OTP sent! Check your inbox.');
      setStep('otp');
      setCountdown(300); // 5 min
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Allow only digits
    if (value && !/^\d$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    setErrors({});

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setOtpDigits(updated);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) { setErrors({ otp: 'Please enter all 6 digits' }); return; }
    setLoading(true);
    setErrors({});
    try {
      const { data } = await authService.verifyOtp({ email, otp });
      setResetToken(data.reset_token);
      toast.success('OTP verified!');
      setStep('password');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authService.requestOtp(email);
      toast.success('New OTP sent!');
      setCountdown(300);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const ve = {};
    if (!newPassword) ve.newPassword = 'Password is required';
    else if (!PASSWORD_REGEX.test(newPassword)) ve.newPassword = 'Min 8 chars, 1 uppercase, 1 number';
    if (newPassword !== confirm) ve.confirm = 'Passwords do not match';
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    setErrors({});
    try {
      await authService.resetPassword({ reset_token: resetToken, new_password: newPassword });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // ── Format countdown ──────────────────────────────────────────────
  const fmtCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── Step indicator ────────────────────────────────────────────────
  const steps = [
    { key: 'email',    label: 'Email',    icon: <RiMailSendLine /> },
    { key: 'otp',      label: 'Verify',   icon: <RiShieldKeyholeLine /> },
    { key: 'password', label: 'Reset',    icon: <RiLockPasswordLine /> },
  ];
  const stepIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Brand Side */}
        <div className="text-center flex-1 animate-slide-up">
          <img src={logo} alt="Plantaech Logo" className="h-40 lg:h-56 mx-auto object-contain mb-8 drop-shadow-sm" />
          <h2 className="text-2xl lg:text-3xl text-gray-700 font-medium leading-snug max-w-md mx-auto">
            {step === 'email'    && 'Enter your email to receive a password reset code.'}
            {step === 'otp'      && 'Check your inbox for the 6-digit verification code.'}
            {step === 'password' && 'Almost done! Set your new password below.'}
          </h2>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-[420px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${i <= stepIdx ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {s.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 transition-all duration-300
                      ${i < stepIdx ? 'bg-brand-secondary' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            <h1 className="text-2xl font-black mb-1 text-brand-secondary">
              {step === 'email'    && 'Forgot Password'}
              {step === 'otp'      && 'Enter OTP'}
              {step === 'password' && 'New Password'}
            </h1>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              {step === 'email'    && 'We\'ll send a verification code to your email.'}
              {step === 'otp'      && `Code sent to ${email}`}
              {step === 'password' && 'Choose a strong password for your account.'}
            </p>

            {/* ──── Step 1: Email ──── */}
            {step === 'email' && (
              <form onSubmit={handleRequestOtp} className="space-y-4" id="forgot-email-form">
                <div>
                  <input
                    id="forgot-email"
                    type="email" className="form-input text-base py-3" placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    autoFocus
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-3 font-bold rounded-lg bg-brand-secondary hover:bg-brand-secondary/90">
                    {loading ? <span className="spinner w-5 h-5 border-white border-t-transparent" /> : <RiMailSendLine className="text-lg" />}
                    Send OTP
                  </button>
                </div>
                <div className="text-center pt-2">
                  <Link to="/login" className="text-sm font-medium text-brand-secondary hover:underline">Back to login</Link>
                </div>
              </form>
            )}

            {/* ──── Step 2: OTP ──── */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4" id="forgot-otp-form">
                {/* 6 digit boxes */}
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 outline-none transition-all"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                {errors.otp && <p className="form-error text-center">{errors.otp}</p>}

                {/* Countdown & resend */}
                <div className="text-center text-sm text-gray-500">
                  {countdown > 0 ? (
                    <span>Resend in <span className="font-bold text-brand-secondary">{fmtCountdown(countdown)}</span></span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={loading}
                      className="font-medium text-brand-secondary hover:underline disabled:opacity-50">
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-3 font-bold rounded-lg bg-brand-secondary hover:bg-brand-secondary/90">
                    {loading ? <span className="spinner w-5 h-5 border-white border-t-transparent" /> : <RiShieldKeyholeLine className="text-lg" />}
                    Verify OTP
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setStep('email'); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
                    className="text-sm font-medium text-gray-500 hover:text-brand-secondary inline-flex items-center gap-1">
                    <RiArrowLeftLine /> Change email
                  </button>
                </div>
              </form>
            )}

            {/* ──── Step 3: New Password ──── */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4" id="forgot-password-form">
                <div>
                  <div className="relative">
                    <input
                      id="forgot-new-password"
                      type={showPw ? 'text' : 'password'} className="form-input text-base py-3 pr-10" placeholder="New password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: '' }); }}
                      autoFocus
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
                </div>

                <div>
                  <input
                    id="forgot-confirm"
                    type={showPw ? 'text' : 'password'} className="form-input text-base py-3" placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors({ ...errors, confirm: '' }); }}
                  />
                  {errors.confirm && <p className="form-error">{errors.confirm}</p>}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-3 font-bold rounded-lg bg-brand-secondary hover:bg-brand-secondary/90">
                    {loading ? <span className="spinner w-5 h-5 border-white border-t-transparent" /> : <RiLockPasswordLine className="text-lg" />}
                    Reset Password
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link to="/login" className="text-sm font-medium text-brand-secondary hover:underline">Back to login</Link>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
