import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, authService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiEditLine, RiCheckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm]     = useState({ first_name: '', last_name: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name||'', last_name: user.last_name||'', phone: user.phone||'' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userService.updateProfile(form);
      updateUser({ ...user, ...data.user });
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await authService.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    finally { setPwLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12 max-w-2xl">
          <h1 className="heading-section mb-8">PROFILE</h1>
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-sm uppercase tracking-wider">Personal Information</h2>
                <button onClick={()=>setEditing(!editing)} className="btn-outline btn-sm flex items-center gap-1.5">
                  {editing ? <><RiCheckLine/> Cancel</> : <><RiEditLine/> Edit</>}
                </button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-xl font-black">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-bold">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className={`badge mt-1 ${user?.role==='admin'?'badge-black':'badge-outline'}`}>{user?.role}</span>
                </div>
              </div>
              {editing ? (
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label">First Name</label>
                      <input className="form-input" value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} />
                    </div>
                    <div><label className="form-label">Last Name</label>
                      <input className="form-input" value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))} />
                    </div>
                  </div>
                  <div><label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary btn-sm disabled:opacity-50">
                    {loading?'Saving...':'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">First Name</p><p>{user?.first_name}</p></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Last Name</p><p>{user?.last_name}</p></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Email</p><p>{user?.email}</p></div>
                  <div><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Phone</p><p>{user?.phone||'—'}</p></div>
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="card p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-5">Change Password</h2>
              <form onSubmit={changePassword} className="space-y-4">
                <div><label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={pwForm.current_password} onChange={e=>setPwForm(f=>({...f,current_password:e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={pwForm.new_password} onChange={e=>setPwForm(f=>({...f,new_password:e.target.value}))} />
                  </div>
                  <div><label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} />
                  </div>
                </div>
                <button type="submit" disabled={pwLoading} className="btn-primary btn-sm disabled:opacity-50">
                  {pwLoading?'Changing...':'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
