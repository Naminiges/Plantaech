import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RiPlantLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex flex-col border-t border-gray-200">
      <div className="border-b border-gray-200 py-4 px-6">
        <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-tight w-fit"><RiPlantLine /> PLANTAECH</Link>
      </div>
      <div className="flex-1 flex">
        <div className="hidden lg:flex w-64 bg-gray-50 border-r border-gray-200 items-center justify-center flex-shrink-0">
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-3">
              <RiPlantLine className="text-3xl text-gray-300" />
            </div>
            <p className="text-xs text-gray-300 uppercase tracking-widest">Join Plantaech</p>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-lg animate-slide-up">
            <h1 className="text-3xl font-black mb-1">Sign up</h1>
            <p className="text-sm text-gray-500 mb-8">Please enter your details. We'll never share your email.</p>
            <form onSubmit={handleSubmit} id="register-form" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['reg-first','First name','first_name'],['reg-last','Last name','last_name']].map(([id,lbl,k])=>(
                  <div key={k}><label className="form-label">{lbl}</label>
                    <input id={id} type="text" className="form-input" value={form[k]} onChange={e=>set(k,e.target.value)} />
                    {errors[k] && <p className="form-error">{errors[k]}</p>}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Email address</label>
                  <input id="reg-email" type="email" className="form-input" placeholder="name@example.com" value={form.email} onChange={e=>set('email',e.target.value)} />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div><label className="form-label">Phone number <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input id="reg-phone" type="tel" className="form-input" placeholder="081x or +62 81x" value={form.phone} onChange={e=>set('phone',e.target.value)} />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Password</label>
                  <div className="relative">
                    <input id="reg-password" type={showPw?'text':'password'} className="form-input pr-10" placeholder="Create password" value={form.password} onChange={e=>set('password',e.target.value)} />
                    <button type="button" tabIndex={-1} onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw?<RiEyeOffLine/>:<RiEyeLine/>}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                <div><label className="form-label">Confirm password</label>
                  <input id="reg-confirm" type={showPw?'text':'password'} className="form-input" placeholder="Repeat password" value={form.confirm} onChange={e=>set('confirm',e.target.value)} />
                  {errors.confirm && <p className="form-error">{errors.confirm}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-500">Already have an account? <Link to="/login" className="font-semibold text-black hover:underline">Click Login</Link></p>
              <div className="flex gap-3 pt-2">
                <button type="button" id="cancel-register-btn" onClick={()=>navigate(-1)} className="btn-outline">Cancel</button>
                <button type="submit" id="create-account-btn" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading && <span className="spinner w-4 h-4 border-white border-t-transparent"/>} Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 py-3 px-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">© 2026 Plantaech</p>
        <div className="flex gap-4 text-xs text-gray-400">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
