import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forumService } from '../services';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ReportModal from '../components/ui/ReportModal';
import { RiAddLine, RiSearchLine, RiFlag2Line, RiChat1Line, RiPushpinLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'penyakit_tanaman',  label: 'Penyakit Tanaman' },
  { value: 'tips_pertanian',    label: 'Tips Pertanian' },
  { value: 'tanya_jawab',       label: 'Tanya Jawab' },
  { value: 'pupuk_nutrisi',     label: 'Pupuk & Nutrisi' },
  { value: 'hama_pengendalian', label: 'Hama & Pengendalian' },
  { value: 'umum',              label: 'Umum' },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c=>[c.value, c.label]));

export default function Community() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [reportTarget, setReportTarget] = useState(null);
  const limit = 15;

  const fetchThreads = () => {
    setLoading(true);
    forumService.getThreads({ page, limit, category: category||undefined, search: search||undefined })
      .then(r => { setThreads(r.data.threads); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load forum'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchThreads(); }, [page, category]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchThreads(); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="heading-section">COMMUNITY</h1>
            {isAuthenticated
              ? <Link to="/community/new" id="new-question-btn" className="btn-primary btn-sm flex items-center gap-1.5"><RiAddLine /> New Question</Link>
              : <div className="text-xs text-gray-500 border border-gray-200 px-3 py-2">
                  <Link to="/login" className="font-semibold text-black hover:underline">Log in</Link> to post a question
                </div>
            }
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="forum-search" type="text" className="form-input pl-9"
                  placeholder="Search discussions..." value={search}
                  onChange={e=>setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-outline btn-sm">Search</button>
            </form>
            <select
              id="forum-category-filter"
              className="form-input w-auto"
              value={category} onChange={e=>{setCategory(e.target.value); setPage(1);}}
            >
              {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Thread List */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner w-8 h-8"/></div>
          ) : threads.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No discussions found.</div>
          ) : (
            <div className="space-y-2">
              {threads.map(t => {
                const user = t.users;
                const commentCount = t.comments?.[0]?.count ?? 0;
                return (
                  <div key={t.id} className="card p-4 flex gap-4 hover:shadow-card transition-shadow">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {t.is_pinned && <RiPushpinLine className="text-xs text-gray-400 flex-shrink-0 mt-0.5" />}
                        <Link to={`/community/${t.id}`} id={`thread-${t.id}`} className="font-semibold text-sm hover:underline underline-offset-2 line-clamp-2">
                          {t.title}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        {t.category && <span className="badge-outline badge">{CAT_LABEL[t.category] || t.category}</span>}
                        {t.tags?.map(tag=><span key={tag} className="badge-outline badge">{tag}</span>)}
                        <span>by <span className="text-gray-600 font-medium">{user?.first_name} {user?.last_name}</span></span>
                        <span>{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <button
                        id={`report-thread-${t.id}`}
                        onClick={()=>setReportTarget({threadId: t.id})}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        title="Report"
                      >
                        <RiFlag2Line className="text-sm"/>
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <RiChat1Line/> {commentCount}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {total > limit && (
            <div className="flex justify-center gap-3 mt-8">
              <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="btn-outline btn-sm disabled:opacity-40">← Previous</button>
              <span className="text-sm text-gray-500 self-center">Page {page} of {Math.ceil(total/limit)}</span>
              <button disabled={page>=Math.ceil(total/limit)} onClick={()=>setPage(p=>p+1)} className="btn-outline btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ReportModal isOpen={!!reportTarget} onClose={()=>setReportTarget(null)} threadId={reportTarget?.threadId} />
    </div>
  );
}
