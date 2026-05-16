import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, authService, forumService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiEditLine, RiCloseLine, RiChat1Line, RiFileTextLine, RiListCheck2, RiCameraLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
const avatarSrc = (avatar) => avatar ? (avatar.startsWith('http') ? avatar : `${API_BASE}${avatar}`) : null;

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Profile() {
  const { user, updateUser } = useAuth();

  // Edit modal state
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({ first_name: '', last_name: '', phone: '' });
  const [pwForm,    setPwForm]    = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving,    setSaving]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarConfirm, setAvatarConfirm] = useState('idle'); // 'idle' | 'upload' | 'delete'
  const [pendingFile, setPendingFile] = useState(null);      // file waiting for confirm
  const [pendingPreview, setPendingPreview] = useState(null); // object URL for preview
  const avatarInputRef = useRef(null);

  // When user picks a file → show confirmation instead of uploading immediately
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar must be under 2 MB'); return; }
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setAvatarConfirm('upload');
    e.target.value = '';
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setAvatarUploading(true);
    try {
      const { data } = await userService.updateAvatar(pendingFile);
      updateUser({ avatar: data.user.avatar });
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to update avatar'); }
    finally {
      setAvatarUploading(false);
      setAvatarConfirm('idle');
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingFile(null); setPendingPreview(null);
    }
  };

  const cancelAvatarConfirm = () => {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null); setPendingPreview(null);
    setAvatarConfirm('idle');
  };

  const confirmDelete = async () => {
    setAvatarUploading(true);
    try {
      await userService.removeAvatar();
      updateUser({ avatar: null });
      toast.success('Profile photo removed.');
    } catch { toast.error('Failed to remove avatar'); }
    finally { setAvatarUploading(false); setAvatarConfirm('idle'); }
  };

  // Activity feed state
  const [tab,      setTab]      = useState('all'); // 'all' | 'posts' | 'comments'
  const [threads,  setThreads]  = useState([]);
  const [comments, setComments] = useState([]);
  const [actLoading, setActLoading] = useState(true);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' });
  }, [user]);

  // Load activity when user is ready
  useEffect(() => {
    if (!user?.id) return;
    setActLoading(true);
    Promise.all([
      forumService.getMyThreads(),
      forumService.getMyComments(),
    ]).then(([tr, co]) => {
      setThreads(tr.data.threads || []);
      setComments(co.data.comments || []);
    }).catch(() => {}).finally(() => setActLoading(false));
  }, [user?.id]);

  const openEdit = () => {
    setForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' });
    setPwForm({ current_password: '', new_password: '', confirm: '' });
    setEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(form);
      updateUser({ ...user, ...data.user });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current_password) { toast.error('Enter your current password'); return; }
    if (!PASSWORD_REGEX.test(pwForm.new_password)) {
      toast.error('New password must be min 8 chars, 1 uppercase, 1 number'); return;
    }
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await authService.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed!');
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  // Determine display state for each item:
  // 'active'        → show normally
  // 'self_deleted'  → hide silently (user deleted it themselves)
  // 'mod_removed'   → show greyed out with "Removed by moderator"
  const itemState = (item, ownerId) => {
    if (!item.is_deleted) return 'active';
    return item.deleted_by === ownerId ? 'self_deleted' : 'mod_removed';
  };

  // Build combined feed, skip self-deleted items
  const allActivity = [
    ...threads
      .map(t  => ({ type: 'post',    date: t.created_at, data: t,  state: itemState(t, user?.id) }))
      .filter(i => i.state !== 'self_deleted'),
    ...comments
      .map(c  => ({ type: 'comment', date: c.created_at, data: c,  state: itemState(c, user?.id) }))
      .filter(i => i.state !== 'self_deleted'),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const feedItems = tab === 'all'     ? allActivity
                  : tab === 'posts'   ? allActivity.filter(i => i.type === 'post')
                  : allActivity.filter(i => i.type === 'comment');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12 max-w-2xl">
          <h1 className="text-3xl font-black text-brand-secondary mb-8">PROFILE</h1>

          {/* ── Profile card ───────────────────────────────── */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar — clickable when editing */}
                <div className="relative flex-shrink-0">
                  <div
                    onClick={() => editing && avatarConfirm === 'idle' && avatarInputRef.current?.click()}
                    className={`w-20 h-20 rounded-full overflow-hidden bg-brand-primary-light text-brand-secondary flex items-center justify-center text-3xl font-black select-none transition-opacity ${
                      editing ? 'cursor-pointer hover:opacity-80' : ''
                    } ${avatarUploading ? 'opacity-50' : ''}`}
                  >
                    {/* Show pending preview if in upload-confirm state */}
                    {pendingPreview
                      ? <img src={pendingPreview} alt="preview" className="w-full h-full object-cover" />
                      : avatarSrc(user?.avatar)
                        ? <img src={avatarSrc(user?.avatar)} alt="avatar" className="w-full h-full object-cover" />
                        : <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                    }
                  </div>
                  {editing && avatarConfirm === 'idle' && (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 w-7 h-7 bg-brand-secondary text-white rounded-full flex items-center justify-center shadow-md border-2 border-white hover:bg-brand-accent transition-colors"
                      title="Change avatar"
                    >
                      {avatarUploading
                        ? <span className="spinner w-2.5 h-2.5 border-white border-t-transparent" />
                        : <RiCameraLine className="text-xs" />}
                    </button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="font-black text-xl text-brand-secondary">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-500 font-medium mb-2">{user?.email}</p>
                  <span className={`badge ${user?.role === 'admin' ? 'bg-brand-accent text-white border-brand-accent' : 'bg-brand-primary-light text-brand-secondary border-brand-primary-light'}`}>{user?.role}</span>
                </div>
              </div>
              <button onClick={openEdit} className="btn-outline rounded-full px-5 py-2 flex items-center gap-2 flex-shrink-0">
                <RiEditLine className="text-lg" /> Edit Profile
              </button>
            </div>

            {!editing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mt-8 pt-8 border-t border-gray-100">
                <div><p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1.5">First Name</p><p className="font-medium text-gray-700">{user?.first_name}</p></div>
                <div><p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1.5">Last Name</p><p className="font-medium text-gray-700">{user?.last_name}</p></div>
                <div><p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1.5">Email</p><p className="font-medium text-gray-700">{user?.email}</p></div>
                <div><p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-1.5">Phone</p><p className="font-medium text-gray-700">{user?.phone || '—'}</p></div>
              </div>
            )}
          </div>

          {/* ── Edit overlay panel ─────────────────────────── */}
          {editing && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 animate-slide-up mb-8 relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="font-black text-xl text-brand-secondary uppercase">Edit Profile</h2>
                <button onClick={() => { setEditing(false); cancelAvatarConfirm(); }} className="p-2 text-gray-400 hover:text-brand-danger bg-gray-50 hover:bg-red-50 rounded-full transition-colors absolute top-6 right-6">
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              {/* ─ Avatar management ─ */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4">Profile Photo</p>

                {/* Upload confirmation */}
                {avatarConfirm === 'upload' && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <img src={pendingPreview} alt="preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-black flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Use this photo?</p>
                      <p className="text-xs text-gray-400">This will replace your current profile photo.</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={cancelAvatarConfirm} className="btn-outline btn-sm rounded-full px-4 text-xs">Cancel</button>
                      <button onClick={confirmUpload} disabled={avatarUploading} className="btn-primary btn-sm rounded-full px-4 text-xs disabled:opacity-50">
                        {avatarUploading ? <span className="spinner w-3 h-3 border-white border-t-transparent" /> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete confirmation */}
                {avatarConfirm === 'delete' && (
                  <div className="flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-700">Remove profile photo?</p>
                      <p className="text-xs text-red-500">Your initials will be shown instead.</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setAvatarConfirm('idle')} className="btn-outline btn-sm rounded-full px-4 text-xs">Cancel</button>
                      <button onClick={confirmDelete} disabled={avatarUploading} className="text-xs px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50">
                        {avatarUploading ? <span className="spinner w-3 h-3 border-white border-t-transparent" /> : 'Remove'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Idle state buttons */}
                {avatarConfirm === 'idle' && (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => avatarInputRef.current?.click()}
                      className="btn-outline rounded-full px-4 py-2 text-sm font-medium flex items-center gap-1.5 hover:border-brand-accent hover:text-brand-accent">
                      <RiCameraLine className="text-lg" /> {avatarSrc(user?.avatar) ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {avatarSrc(user?.avatar) && (
                      <button type="button" onClick={() => setAvatarConfirm('delete')}
                        className="text-sm font-medium px-4 py-2 text-brand-danger border border-red-200 rounded-full hover:bg-red-50 transition-colors">
                        Remove Photo
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ─ Personal info ─ */}
              <form onSubmit={saveProfile} className="space-y-4 pb-6 border-b border-gray-100 mb-6">
                <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4">Personal Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">First Name</label>
                    <input className="form-input" value={form.first_name}
                      onChange={e => setForm(f => ({...f, first_name: e.target.value}))} />
                  </div>
                  <div><label className="form-label">Last Name</label>
                    <input className="form-input" value={form.last_name}
                      onChange={e => setForm(f => ({...f, last_name: e.target.value}))} />
                  </div>
                </div>
                <div><label className="form-label">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input className="form-input" placeholder="081x or +62 81x" value={form.phone}
                    onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>

              {/* ─ Password change ─ */}
              <form onSubmit={changePassword} className="space-y-4">
                <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4">Change Password</p>
                <div><label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={pwForm.current_password}
                    onChange={e => setPwForm(f => ({...f, current_password: e.target.value}))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={pwForm.new_password}
                      onChange={e => setPwForm(f => ({...f, new_password: e.target.value}))} />
                    <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
                  </div>
                  <div><label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))} />
                  </div>
                </div>
                <button type="submit" disabled={pwSaving} className="btn-outline rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50 hover:border-brand-accent hover:text-brand-accent">
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* ── Activity feed ──────────────────────────────── */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="font-black text-xl text-brand-secondary uppercase">Activity</h2>
              {/* Tab filter */}
              <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200 overflow-hidden text-sm">
                {[
                  { id: 'all',      icon: <RiListCheck2  />, label: 'All'      },
                  { id: 'posts',    icon: <RiFileTextLine/>, label: 'Posts'    },
                  { id: 'comments', icon: <RiChat1Line   />, label: 'Comments' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-medium transition-all duration-200 ${tab === t.id ? 'bg-white shadow text-brand-secondary' : 'text-gray-500 hover:text-brand-secondary'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {actLoading ? (
              <div className="flex justify-center py-12"><div className="spinner w-6 h-6 border-brand-accent border-t-transparent"/></div>
            ) : feedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No activity yet.</div>
            ) : (
              <div className="space-y-4">
                {feedItems.map((item, idx) => (
                  item.type === 'post' ? (() => {
                    const removed = item.state === 'mod_removed';
                    const inner = (
                      <>
                        <RiFileTextLine className={`flex-shrink-0 mt-0.5 ${removed ? 'text-gray-200' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium line-clamp-1 ${removed ? 'line-through text-gray-300' : ''}`}>{item.data.title}</p>
                          <p className={`text-xs mt-0.5 line-clamp-2 ${removed ? 'text-gray-300' : 'text-gray-400'}`}>{item.data.content}</p>
                          <p className="text-xs text-gray-300 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`badge text-xs flex-shrink-0 ${removed ? 'bg-red-50 text-red-400 border-red-200' : 'bg-brand-primary-light text-brand-secondary border-brand-primary-light'}`}>
                          {removed ? 'Removed by moderator' : 'Post'}
                        </span>
                      </>
                    );
                    return removed
                      ? <div key={`p-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 opacity-60 cursor-not-allowed">{inner}</div>
                      : <Link key={`p-${idx}`} to={`/community/${item.data.id}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-brand-accent transition-all block">{inner}</Link>;
                  })() : (() => {
                    // Comment: check both comment state and parent thread state
                    const thread = item.data.threads;
                    const commentRemoved = item.state === 'mod_removed';
                    const threadRemoved  = thread?.is_deleted && thread?.deleted_by !== user?.id;
                    const threadSelfDel  = thread?.is_deleted && thread?.deleted_by === user?.id;
                    const isDisabled = commentRemoved || threadRemoved || threadSelfDel;
                    const inner = (
                      <>
                        <RiChat1Line className={`flex-shrink-0 mt-0.5 ${isDisabled ? 'text-gray-200' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs mb-0.5 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                            on <span className={`font-medium ${isDisabled ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                              {thread?.title ?? 'Unknown thread'}
                            </span>
                          </p>
                          <p className={`text-sm line-clamp-2 ${isDisabled ? 'text-gray-300' : 'text-gray-700'}`}>{item.data.content}</p>
                          <p className="text-xs text-gray-300 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`badge text-xs flex-shrink-0 ${
                          commentRemoved ? 'bg-red-50 text-red-400 border-red-200'
                          : threadRemoved ? 'bg-gray-100 text-gray-400 border-gray-200'
                          : threadSelfDel ? 'bg-gray-100 text-gray-400 border-gray-200'
                          : 'bg-brand-primary-light text-brand-secondary border-brand-primary-light'
                        }`}>
                          {commentRemoved ? 'Removed by moderator' : threadRemoved ? 'Thread removed' : threadSelfDel ? 'Thread deleted' : 'Comment'}
                        </span>
                      </>
                    );
                    return isDisabled
                      ? <div key={`c-${idx}`} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 opacity-60 cursor-not-allowed">{inner}</div>
                      : <Link key={`c-${idx}`} to={`/community/${thread?.id}`} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md hover:border-brand-accent transition-all block">{inner}</Link>;
                  })()
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
