import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiPlantLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col border-t border-gray-200">
      {/* Minimal header */}
      <div className="border-b border-gray-200 py-4 px-6">
        <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-tight w-fit">
          <RiPlantLine /> PLANTAECH
        </Link>
      </div>

      <div className="flex-1 flex">
        {/* Form side */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm animate-slide-up">
            <h1 className="text-3xl font-black mb-1">Log in</h1>
            <p className="text-sm text-gray-500 mb-8">Give your email to continue. We'll never share your info.</p>

            <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
              <div>
                <label className="form-label">Email</label>
                <input
                  id="login-email"
                  type="email" className="form-input" placeholder="name@example.com"
                  value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: ''}); }}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'} className="form-input pr-10" placeholder="Your password"
                    value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ''}); }}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <p className="text-xs text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-black underline-offset-2 hover:underline">Sign Up</Link>
              </p>

              <div className="flex gap-3 pt-2">
                <button type="button" id="reset-password-btn" className="btn-outline btn-sm">Reset password</button>
                <button type="submit" id="login-submit-btn" disabled={loading} className="btn-primary btn-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <span className="spinner w-3 h-3 border-white border-t-transparent" /> : null}
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Decorative side */}
        <div className="hidden lg:flex flex-1 bg-gray-50 border-l border-gray-200 items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-4">
              <RiPlantLine className="text-4xl text-gray-300" />
            </div>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Plantaech</p>
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className="border-t border-gray-200 py-3 px-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">© 2026 Plantaech</p>
        <div className="flex gap-4 text-xs text-gray-400">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="mailto:plantaech@example.com">Contact Information</a>
        </div>
      </div>
    </div>
  );
}
