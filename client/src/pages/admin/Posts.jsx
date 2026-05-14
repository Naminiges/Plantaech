import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { RiPushpinLine, RiDeleteBin6Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function AdminPosts() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const limit = 20;

  const fetch = () => {
    setLoading(true);
    adminService.getPosts({ page, limit, search: search||undefined })
      .then(r => { setPosts(r.data.posts); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const togglePin = async (id, is_pinned) => {
    try {
      await adminService.pinPost(id, !is_pinned);
      setPosts(p => p.map(x => x.id===id ? {...x,is_pinned:!is_pinned} : x));
      toast.success(!is_pinned ? 'Post pinned' : 'Post unpinned');
    } catch { toast.error('Failed'); }
  };

  const removePost = async (id) => {
    if (!confirm('Remove this post?')) return;
    try {
      await adminService.deletePost(id);
      setPosts(p => p.filter(x => x.id!==id));
      toast.success('Post removed');
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="Post Management">
      <div className="space-y-4">
        <div className="flex gap-3">
          <input className="form-input flex-1 max-w-xs" placeholder="Search posts..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetch()} />
          <button onClick={fetch} className="btn-primary btn-sm">Search</button>
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr>
              <th>Title</th><th>Author</th><th>Category</th><th>Comments</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><div className="spinner mx-auto"/></td></tr>
              ) : posts.map(p => (
                <tr key={p.id}>
                  <td className="max-w-xs">
                    <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                  </td>
                  <td className="text-sm text-gray-500">{p.users?.first_name} {p.users?.last_name}</td>
                  <td><span className="badge badge-outline text-xs">{p.category||'—'}</span></td>
                  <td className="text-center">{p.comments?.[0]?.count||0}</td>
                  <td>
                    <div className="flex gap-1">
                      {p.is_pinned && <span className="badge badge-black text-xs">Pinned</span>}
                      {p.is_deleted && <span className="badge badge-danger text-xs">Deleted</span>}
                      {!p.is_pinned && !p.is_deleted && <span className="badge badge-outline text-xs">Active</span>}
                    </div>
                  </td>
                  <td className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={()=>togglePin(p.id,p.is_pinned)} className="btn-ghost btn-sm p-1.5" title={p.is_pinned?'Unpin':'Pin'}>
                        <RiPushpinLine className={p.is_pinned?'text-black':'text-gray-400'}/>
                      </button>
                      {!p.is_deleted && (
                        <button onClick={()=>removePost(p.id)} className="btn-ghost btn-sm p-1.5 text-red-400">
                          <RiDeleteBin6Line/>
                        </button>
                      )}
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
