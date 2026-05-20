import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]: ''})); };

  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const validate = () => {
    const e = {};
    if (!form.first_name) e.first_name = 'Required';
    if (!form.last_name)  e.last_name  = 'Required';
    if (!form.email)      e.email      = 'Required';
    if (!form.password)   e.password   = 'Required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    else if (!passwordRegex.test(form.password)) e.password = 'Must include 1 uppercase letter and 1 number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (form.phone && !phoneRegex.test(form.phone.replace(/[\s\-]/g, '')))
      e.phone = 'Enter a valid Indonesian number (e.g. 081x or +62 81x)';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setLoading(true);
    try {
      await register({ first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome to Plantaech.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Brand Side */}
        <div className="text-center flex-1 animate-slide-up hidden lg:block">
          <img src={logo} alt="Plantaech Logo" className="h-40 lg:h-56 mx-auto object-contain mb-8 drop-shadow-sm" />
          <h2 className="text-2xl lg:text-3xl text-gray-700 font-medium leading-snug max-w-md mx-auto">
            Join the Revolution. Access advanced plant diagnostics and a thriving community.
          </h2>
        </div>

        {/* Form Side */}
        <div className="w-full max-w-[480px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Show logo on mobile above the form */}
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Plantaech Logo" className="h-32 mx-auto object-contain drop-shadow-sm" />
          </div>

          <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100">
            <h1 className="text-2xl font-black mb-1 text-brand-secondary">Sign Up</h1>
            <p className="text-sm text-gray-500 mb-6 font-medium">It's quick and easy.</p>

            <form onSubmit={handleSubmit} id="register-form" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['reg-first','First name','first_name'],['reg-last','Last name','last_name']].map(([id,lbl,k])=>(
                  <div key={k}>
                    <input id={id} type="text" className="form-input" placeholder={lbl} value={form[k]} onChange={e=>set(k,e.target.value)} />
                    {errors[k] && <p className="form-error mt-1">{errors[k]}</p>}
                  </div>
                ))}
              </div>
              <div>
                <input id="reg-email" type="email" className="form-input" placeholder="Email address" value={form.email} onChange={e=>set('email',e.target.value)} />
                {errors.email && <p className="form-error mt-1">{errors.email}</p>}
              </div>
              <div>
                <input id="reg-phone" type="tel" className="form-input" placeholder="Phone number (optional)" value={form.phone} onChange={e=>set('phone',e.target.value)} />
                {errors.phone && <p className="form-error mt-1">{errors.phone}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <input id="reg-password" type={showPw?'text':'password'} className="form-input pr-10" placeholder="New password" value={form.password} onChange={e=>set('password',e.target.value)} />
                    <button type="button" tabIndex={-1} onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw?<RiEyeOffLine/>:<RiEyeLine/>}
                    </button>
                  </div>
                  {errors.password && <p className="form-error mt-1">{errors.password}</p>}
                </div>
                <div>
                  <input id="reg-confirm" type={showPw?'text':'password'} className="form-input" placeholder="Repeat password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} />
                  {errors.confirm && <p className="form-error mt-1">{errors.confirm}</p>}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-2 mb-4 leading-relaxed">
                By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy.
              </p>
              
              <div className="pt-2 text-center">
                <button type="submit" id="create-account-btn" disabled={loading} className="inline-block bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-lg py-2.5 px-12 rounded-lg transition-colors disabled:opacity-50 min-w-[200px] w-full lg:w-auto flex mx-auto items-center justify-center gap-2">
                  {loading && <span className="spinner w-5 h-5 border-white border-t-transparent"/>} Sign Up
                </button>
              </div>

              <div className="text-center mt-6">
                <Link to="/login" className="text-brand-secondary font-medium hover:underline text-sm">Already have an account?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
