import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { forumService } from '../services';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ReportModal from '../components/ui/ReportModal';
import { RiFlag2Line, RiArrowLeftLine, RiSendPlaneLine, RiDeleteBin6Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function ThreadDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [thread, setThread]   = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    forumService.getThread(id)
      .then(r => { setThread(r.data.thread); setComments(r.data.comments); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await forumService.createComment(id, { content: comment });
      setComments(c => [...c, data.comment]);
      setComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const deleteComment = async (cid) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await forumService.deleteComment(cid);
      setComments(c => c.filter(x => x.id !== cid));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const deleteThread = async () => {
    if (!confirm('Delete this thread?')) return;
    try {
      await forumService.deleteThread(id);
      toast.success('Thread deleted');
      navigate('/community');
    } catch { toast.error('Failed to delete thread'); }
  };

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center" style={{paddingTop:'var(--nav-height)'}}><div className="spinner w-8 h-8"/></div></div>;

  if (notFound) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center" style={{paddingTop:'var(--nav-height)'}}>
        <div className="text-center py-20 max-w-sm">
          <p className="text-5xl mb-4">🗑️</p>
          <h1 className="text-xl font-bold mb-2">Thread Removed</h1>
          <p className="text-sm text-gray-500 mb-6">This thread has been deleted and is no longer available.</p>
          <Link to="/community" className="btn-primary btn-sm">← Back to Community</Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12 max-w-3xl">
          <Link to="/community" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-accent mb-6 transition-colors font-medium">
            <RiArrowLeftLine /> Back to Community
          </Link>

          {thread && (
            <article className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 mb-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-brand-secondary leading-tight">{thread.title}</h1>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={()=>setReportTarget({threadId:id})} className="p-2 rounded-full text-gray-400 hover:text-brand-danger hover:bg-red-50 transition-colors">
                    <RiFlag2Line className="text-xl" />
                  </button>
                  {(user?.id===thread.user_id || user?.role==='admin') && (
                    <button onClick={deleteThread} className="p-2 rounded-full text-gray-400 hover:text-brand-danger hover:bg-red-50 transition-colors">
                      <RiDeleteBin6Line className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-base text-gray-600 whitespace-pre-wrap leading-relaxed mb-6">{thread.content}</p>

              {/* Attached image */}
              {thread.image_url && (() => {
                const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                const src = thread.image_url.startsWith('http') ? thread.image_url : `${API_BASE}${thread.image_url}`;
                return (
                  <div className="mb-4 border border-gray-100 rounded overflow-hidden">
                    <img src={src} alt="Thread attachment" className="w-full max-h-[32rem] object-contain bg-gray-50" />
                  </div>
                );
              })()}

              <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-brand-primary-light text-brand-secondary flex items-center justify-center text-sm font-bold">
                  {thread.users?.first_name?.[0]}
                </div>
                <div>
                  <div className="font-bold text-brand-secondary">{thread.users?.first_name} {thread.users?.last_name}</div>
                  <div className="text-xs text-gray-400 font-medium">{new Date(thread.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </article>
          )}

          {/* Comments */}
          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-accent">{comments.length} Comment{comments.length!==1?'s':''}</p>
            {comments.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary-light text-brand-secondary flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  {c.users?.first_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-base font-bold text-brand-secondary">{c.users?.first_name} {c.users?.last_name}</span>
                    <div className="flex gap-1">
                      <button onClick={()=>setReportTarget({commentId:c.id})} className="text-gray-300 hover:text-brand-danger transition-colors p-1">
                        <RiFlag2Line className="text-base"/>
                      </button>
                      {(user?.id===c.user_id || user?.role==='admin') && (
                        <button onClick={()=>deleteComment(c.id)} className="text-gray-300 hover:text-brand-danger transition-colors p-1">
                          <RiDeleteBin6Line className="text-base"/>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  <p className="text-xs text-gray-400 mt-3 font-medium">{new Date(c.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={submitComment} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <label className="form-label mb-3 block text-brand-secondary">Add a comment</label>
              <textarea
                id="comment-input"
                className="form-input resize-none mb-4 rounded-xl" rows={4}
                placeholder="Share your knowledge or ask a follow-up..."
                value={comment} onChange={e=>setComment(e.target.value)}
              />
              <div className="flex justify-end">
                <button type="submit" id="submit-comment-btn" disabled={submitting||!comment.trim()} className="btn-primary rounded-full px-6 flex items-center gap-2 disabled:opacity-50">
                  {submitting?<span className="spinner w-4 h-4 border-white border-t-transparent"/>:<RiSendPlaneLine className="text-lg"/>} Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="border border-gray-200 p-4 text-center text-sm text-gray-500">
              <Link to="/login" className="font-semibold text-black hover:underline">Log in</Link> to leave a comment.
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ReportModal isOpen={!!reportTarget} onClose={()=>setReportTarget(null)} threadId={reportTarget?.threadId} commentId={reportTarget?.commentId} />
    </div>
  );
}
