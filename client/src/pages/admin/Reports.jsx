import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const STATUS_OPTS = [{v:'pending',l:'Pending'},{v:'resolved',l:'Resolved'},{v:'dismissed',l:'Dismissed'},{v:'all',l:'All'}];
const STATUS_BADGE = { pending:'badge-warning', resolved:'badge-success', dismissed:'badge-outline' };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState('pending');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const limit = 20;

  const fetch = () => {
    setLoading(true);
    adminService.getReports({ status, page, limit })
      .then(r => { setReports(r.data.reports); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status, page]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminService.updateReport(id, newStatus);
      setReports(r => r.map(x => x.id===id ? {...x,status:newStatus} : x));
      toast.success(`Report ${newStatus}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="Report Queue">
      <div className="space-y-4">
        <div className="flex gap-2">
          {STATUS_OPTS.map(s => (
            <button key={s.v} onClick={()=>{setStatus(s.v);setPage(1);}}
              className={`btn-sm btn ${status===s.v?'btn-primary':'btn-outline'}`}>{s.l}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr>
              <th>Reporter</th><th>Reason</th><th>Content</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8"><div className="spinner mx-auto"/></td></tr>
              ) : reports.length===0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No reports found.</td></tr>
              ) : reports.map(r => (
                <tr key={r.id}>
                  <td className="text-sm">{r.users?.first_name} {r.users?.last_name}</td>
                  <td><span className="badge badge-outline capitalize">{r.reason}</span></td>
                  <td className="text-sm text-gray-500 max-w-xs">
                    {r.threads ? <span className="line-clamp-1">Thread: {r.threads.title}</span>
                    : r.comments ? <span className="line-clamp-1">Comment: {r.comments.content}</span>
                    : '—'}
                    {r.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">"{r.description}"</p>}
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[r.status]||'badge-outline'} capitalize`}>{r.status}</span></td>
                  <td className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {r.status==='pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={()=>updateStatus(r.id,'resolved')} className="btn-ghost btn-sm p-1.5 text-green-500" title="Resolve">
                          <RiCheckLine/>
                        </button>
                        <button onClick={()=>updateStatus(r.id,'dismissed')} className="btn-ghost btn-sm p-1.5 text-gray-400" title="Dismiss">
                          <RiCloseLine/>
                        </button>
                      </div>
                    )}
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
