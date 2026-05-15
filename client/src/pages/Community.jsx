import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forumService } from '../services';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ReportModal from '../components/ui/ReportModal';
import { RiAddLine, RiSearchLine, RiFlag2Line, RiChat1Line, RiPushpinLine, RiImageLine } from 'react-icons/ri';
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

const CAT_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]));
const API_BASE  = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Community() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [reportTarget, setReportTarget] = useState(null);
  const limit = 15;

  const fetchThreads = () => {
    setLoading(true);
    forumService.getThreads({ page, limit, category: category || undefined, search: search || undefined })
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
            <div>
              <h1 className="heading-section text-brand-secondary mb-2">COMMUNITY FORUM</h1>
              <p className="text-gray-500 font-medium">Discuss plant diseases, get tips, and share your agricultural knowledge.</p>
            </div>
            {isAuthenticated
              ? <Link to="/community/new" id="new-question-btn" className="btn-primary rounded-full px-6 flex items-center gap-2"><RiAddLine className="text-lg" /> Ask Question</Link>
              : <div className="text-sm text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
                  <Link to="/login" className="font-bold text-brand-secondary hover:text-brand-accent transition-colors">Log in</Link> to ask a question
                </div>
            }
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input id="forum-search" type="text" className="form-input pl-11 rounded-full shadow-sm border-gray-200 focus:border-brand-accent"
                  placeholder="Search discussions, symptoms, or tips..." value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="submit" className="btn-outline rounded-full px-6">Search</button>
            </form>
            <select id="forum-category-filter" className="form-input w-auto rounded-full shadow-sm border-gray-200 focus:border-brand-accent"
              value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Thread Cards */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner w-8 h-8"/></div>
          ) : threads.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-brand-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <RiChat1Line className="text-4xl text-brand-accent" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No discussions found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map(t => {
                const user         = t.users;
                const commentCount = t.comments?.[0]?.count ?? 0;
                const imgSrc       = t.image_url
                  ? (t.image_url.startsWith('http') ? t.image_url : `${API_BASE}${t.image_url}`)
                  : null;

                return (
                  <div key={t.id} className="card p-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-4 border-gray-100 bg-white">
                    <div className="flex flex-col sm:flex-row gap-0">
                      
                      {/* Content side */}
                      <div className="flex-1 min-w-0 p-5 lg:p-6 flex flex-col justify-between">
                        <div>
                          {/* Pin + Title */}
                          <div className="flex items-start gap-2 mb-2">
                            {t.is_pinned && <RiPushpinLine className="text-brand-accent flex-shrink-0 mt-1 text-lg" />}
                            <Link to={`/community/${t.id}`} id={`thread-${t.id}`}
                              className="font-bold text-lg text-brand-secondary hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
                              {t.title}
                            </Link>
                          </div>
  
                          {/* Content preview */}
                          {t.content && (
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                              {t.content}
                            </p>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                          {t.category && <span className="badge badge-outline">{CAT_LABEL[t.category] || t.category}</span>}
                          {t.tags?.map(tag => <span key={tag} className="px-2 py-1 bg-brand-primary-light rounded text-gray-500">#{tag}</span>)}
                          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                            <div className="w-5 h-5 rounded-full bg-brand-secondary text-white flex items-center justify-center text-[10px] font-bold">
                              {user?.first_name?.[0]}
                            </div>
                            <span><span className="text-brand-secondary">{user?.first_name} {user?.last_name}</span> • {new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right column: Actions & Thumbnail */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-stretch border-t sm:border-t-0 sm:border-l border-gray-100 bg-gray-50/50">
                        <div className="flex-1 flex sm:flex-col items-center justify-center gap-4 sm:gap-2 p-4">
                          <div className="flex items-center gap-1.5 text-gray-500 font-bold">
                            <RiChat1Line className="text-lg text-brand-accent"/> {commentCount}
                          </div>
                          <button id={`report-thread-${t.id}`}
                            onClick={() => setReportTarget({ threadId: t.id })}
                            className="text-gray-400 hover:text-brand-danger transition-colors p-1" title="Report">
                            <RiFlag2Line className="text-lg"/>
                          </button>
                        </div>
                        {/* Image thumbnail */}
                        {imgSrc && (
                          <Link to={`/community/${t.id}`} className="block w-24 sm:w-32 h-24 sm:h-full sm:min-h-[8rem] flex-shrink-0">
                            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {total > limit && (
            <div className="flex justify-center gap-3 mt-8">
              <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="btn-outline btn-sm disabled:opacity-40">← Previous</button>
              <span className="text-sm text-gray-500 self-center">Page {page} of {Math.ceil(total/limit)}</span>
              <button disabled={page>=Math.ceil(total/limit)} onClick={() => setPage(p=>p+1)} className="btn-outline btn-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ReportModal isOpen={!!reportTarget} onClose={() => setReportTarget(null)} threadId={reportTarget?.threadId} />
    </div>
  );
}
