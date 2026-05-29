import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { authService } from '../services';
import logo from '../assets/logo.png';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.current_password) e.current_password = 'Current password is required';
    if (!form.new_password) e.new_password = 'New password is required';
    else if (!PASSWORD_REGEX.test(form.new_password)) e.new_password = 'Min 8 chars, 1 uppercase, 1 number';
    if (form.new_password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    try {
      await authService.changePasswordWithEmail({
        email: form.email,
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast.success('Password updated. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Brand Side */}
        <div className="text-center flex-1 animate-slide-up">
          <img src={logo} alt="Plantaech Logo" className="h-40 lg:h-56 mx-auto object-contain mb-8 drop-shadow-sm" />
          <h2 className="text-2xl lg:text-3xl text-gray-700 font-medium leading-snug max-w-md mx-auto">
            Update your password with your email and current password.
          </h2>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-[420px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
            <h1 className="text-2xl font-black mb-1 text-brand-secondary">Forgot Password</h1>
            <p className="text-sm text-gray-500 mb-6 font-medium">Enter your email, current password, and new password.</p>

            <form onSubmit={handleSubmit} className="space-y-4" id="forgot-password-form">
              <div>
                <input
                  id="forgot-email"
                  type="email" className="form-input text-base py-3" placeholder="Email address"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    id="forgot-current-password"
                    type={showPw ? 'text' : 'password'} className="form-input text-base py-3 pr-10" placeholder="Current password"
                    value={form.current_password}
                    onChange={e => { setForm({ ...form, current_password: e.target.value }); setErrors({ ...errors, current_password: '' }); }}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
                {errors.current_password && <p className="form-error">{errors.current_password}</p>}
              </div>

              <div>
                <input
                  id="forgot-new-password"
                  type={showPw ? 'text' : 'password'} className="form-input text-base py-3" placeholder="New password"
                  value={form.new_password}
                  onChange={e => { setForm({ ...form, new_password: e.target.value }); setErrors({ ...errors, new_password: '' }); }}
                />
                {errors.new_password && <p className="form-error">{errors.new_password}</p>}
              </div>

              <div>
                <input
                  id="forgot-confirm"
                  type={showPw ? 'text' : 'password'} className="form-input text-base py-3" placeholder="Confirm new password"
                  value={form.confirm}
                  onChange={e => { setForm({ ...form, confirm: e.target.value }); setErrors({ ...errors, confirm: '' }); }}
                />
                {errors.confirm && <p className="form-error">{errors.confirm}</p>}
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-3 font-bold rounded-lg bg-brand-secondary hover:bg-brand-secondary/90">
                  {loading ? <span className="spinner w-5 h-5 border-white border-t-transparent" /> : null}
                  Update Password
                </button>
              </div>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm font-medium text-brand-secondary hover:underline">Back to login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
