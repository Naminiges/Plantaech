import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { RiShieldLine, RiUserLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const limit = 20;

  const fetch = () => {
    setLoading(true);
    adminService.getUsers({ page, limit, search: search||undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const toggleBan = async (id, is_banned) => {
    try {
      await adminService.banUser(id, !is_banned);
      setUsers(u => u.map(x => x.id===id ? {...x,is_banned:!is_banned} : x));
      toast.success(!is_banned ? 'User banned' : 'User unbanned');
    } catch { toast.error('Failed'); }
  };

  const toggleRole = async (id, role) => {
    const newRole = role==='admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(id, newRole);
      setUsers(u => u.map(x => x.id===id ? {...x,role:newRole} : x));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="User Management">
      <div className="space-y-4">
        <div className="flex gap-3">
          <input className="form-input flex-1 max-w-xs" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetch()} />
          <button onClick={fetch} className="btn-primary btn-sm">Search</button>
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><div className="spinner mx-auto"/></td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.first_name} {u.last_name}</td>
                  <td className="text-gray-500">{u.email}</td>
                  <td><span className={`badge ${u.role==='admin'?'badge-black':'badge-outline'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.is_banned?'badge-danger':'badge-success'}`}>{u.is_banned?'Banned':'Active'}</span></td>
                  <td className="text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={()=>toggleRole(u.id,u.role)} className="btn-ghost btn-sm p-1.5 text-xs" title={u.role==='admin'?'Remove admin':'Make admin'}>
                        {u.role==='admin'?<RiUserLine/>:<RiShieldLine/>}
                      </button>
                      <button onClick={()=>toggleBan(u.id,u.is_banned)} className={`btn-ghost btn-sm p-1.5 text-xs ${u.is_banned?'text-green-500':'text-red-400'}`} title={u.is_banned?'Unban':'Ban'}>
                        {u.is_banned?<RiCheckLine/>:<RiCloseLine/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > limit && (
          <div className="flex gap-3">
            <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn-outline btn-sm disabled:opacity-40">←</button>
            <span className="text-sm self-center">Page {page} of {Math.ceil(total/limit)}</span>
            <button disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} className="btn-outline btn-sm disabled:opacity-40">→</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
