import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Brand Side */}
        <div className="text-center lg:text-left flex-1 animate-slide-up">
          <img src={logo} alt="Plantaech Logo" className="h-28 lg:h-40 mx-auto lg:mx-0 object-contain mb-6 lg:-ml-4 drop-shadow-sm" />
          <h2 className="text-2xl lg:text-3xl text-gray-700 font-medium leading-snug max-w-md mx-auto lg:mx-0">
            Diagnostic Precision for Agriculture. Empowering farmers with AI-driven insights.
          </h2>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-[420px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
            <h1 className="text-2xl font-black mb-1 text-brand-secondary">Log In</h1>
            <p className="text-sm text-gray-500 mb-6 font-medium">Enter your details to access your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
              <div>
                <input
                  id="login-email"
                  type="email" className="form-input text-base py-3" placeholder="Email address"
                  value={form.email} onChange={e => { setForm({...form, email: e.target.value}); setErrors({...errors, email: ''}); }}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'} className="form-input text-base py-3 pr-10" placeholder="Password"
                    value={form.password} onChange={e => { setForm({...form, password: e.target.value}); setErrors({...errors, password: ''}); }}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div className="pt-2">
                <button type="submit" id="login-submit-btn" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-base py-3 font-bold rounded-lg bg-brand-secondary hover:bg-brand-secondary/90">
                  {loading ? <span className="spinner w-5 h-5 border-white border-t-transparent" /> : null}
                  Log In
                </button>
              </div>

              <div className="text-center pt-2">
                <button type="button" id="reset-password-btn" className="text-sm font-medium text-brand-secondary hover:underline">Forgotten password?</button>
              </div>

              <div className="flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="text-center">
                <Link to="/register" className="inline-block bg-[#42b72a] hover:bg-[#36a420] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Create new account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
