import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diagnosisService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiHistoryLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const SEV = { healthy: 'badge-success', mild: 'badge-warning', moderate: 'badge-warning', severe: 'badge-danger' };

export default function History() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    diagnosisService.getHistory({ page, limit })
      .then(r => { setData(r.data.diagnoses); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12">
          <div className="mb-10 border-b border-gray-200 pb-6">
            <h1 className="heading-section text-brand-secondary mb-2">DIAGNOSIS HISTORY</h1>
            <p className="text-gray-500 font-medium">Track and monitor your past plant health analyses.</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>
          ) : data.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-brand-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <RiHistoryLine className="text-5xl text-brand-accent" />
              </div>
              <p className="text-gray-500 mb-8 font-medium text-lg">No diagnoses yet. Start scanning your plants!</p>
              <Link to="/" className="btn-primary btn-lg rounded-full px-8">Analyze your first plant</Link>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.map(d => (
                  <Link key={d.id} to={`/diagnosis/${d.id}`} state={{diagnosis: d}} className="card-hover overflow-hidden block flex flex-col h-full bg-white">
                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                      {d.image_url
                        ? <img src={`${API_BASE}${d.image_url}`} alt={d.disease_name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl bg-brand-primary-light">🌿</div>
                      }
                      <div className="absolute top-3 right-3">
                        <span className={`badge shadow-sm ${SEV[d.severity] || 'badge-outline'}`}>{d.severity}</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <p className="font-bold text-base text-brand-secondary uppercase tracking-wide mb-3">{d.disease_name}</p>
                      <div className="mt-auto flex items-center justify-between text-sm text-gray-500 font-medium">
                        <span className="bg-gray-100 px-2 py-1 rounded-md">{d.confidence?.toFixed(1)}% match</span>
                        <span>{new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {total > limit && (
                <div className="flex justify-center gap-3 mt-8">
                  <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn-outline btn-sm disabled:opacity-40">← Previous</button>
                  <span className="text-sm text-gray-500 self-center">Page {page} of {Math.ceil(total/limit)}</span>
                  <button disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} className="btn-outline btn-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
