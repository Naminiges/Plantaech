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
    <div className="min-h-screen flex bg-brand-primary-light relative">
      {/* Minimal header */}
      <div className="absolute top-0 left-0 z-10 py-6 px-8">
        <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight w-fit text-brand-secondary">
          <RiPlantLine className="text-brand-accent text-3xl" /> PLANTAECH
        </Link>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Form side */}
        <div className="flex-1 flex items-center justify-center p-8 relative z-10">
          <div className="w-full max-w-sm animate-slide-up bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <h1 className="text-3xl font-black mb-2 text-brand-secondary">Welcome Back</h1>
            <p className="text-sm text-gray-500 mb-8 font-medium">Please enter your details to sign in.</p>

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

              <p className="text-sm text-gray-500 text-center font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-brand-secondary hover:text-brand-accent transition-colors">Sign Up</Link>
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
        <div className="hidden lg:block lg:w-1/2 relative">
          <img src="/images/auth-bg.png" alt="Modern Greenhouse" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-brand-secondary/20 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-white text-3xl font-bold mb-3 drop-shadow-md">Diagnostic Precision<br/>for Agriculture.</h2>
            <p className="text-white/90 text-lg max-w-md drop-shadow">Empowering farmers with AI-driven insights and instant disease detection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
