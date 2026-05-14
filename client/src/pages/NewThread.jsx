import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiArrowLeftLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'penyakit_tanaman',  label: 'Penyakit Tanaman' },
  { value: 'tips_pertanian',    label: 'Tips Pertanian' },
  { value: 'tanya_jawab',       label: 'Tanya Jawab' },
  { value: 'pupuk_nutrisi',     label: 'Pupuk & Nutrisi' },
  { value: 'hama_pengendalian', label: 'Hama & Pengendalian' },
  { value: 'umum',              label: 'Umum' },
];

const PRESET_TAGS = ['Tomat','Padi','Cabai','Jagung','Singkong','Bawang','Kangkung','Bayam','Terong','Pepaya'];

export default function NewThread() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ title: '', content: '', category: 'umum', tags: [] });
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => setForm(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t=>t!==tag) : [...f.tags, tag]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    setLoading(true);
    try {
      const { data } = await forumService.createThread(form);
      toast.success('Thread created!');
      navigate(`/community/${data.thread.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create thread');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12 max-w-2xl">
          <button onClick={()=>navigate('/community')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black mb-6 transition-colors">
            <RiArrowLeftLine /> Back to Community
          </button>
          <h1 className="heading-section mb-8">NEW QUESTION</h1>
          <form onSubmit={handleSubmit} id="new-thread-form" className="space-y-5">
            <div>
              <label className="form-label">Title</label>
              <input id="thread-title" type="text" className="form-input" placeholder="What's your question?" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select id="thread-category" className="form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Tags (optional)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_TAGS.map(tag=>(
                  <button key={tag} type="button" id={`tag-${tag}`}
                    onClick={()=>toggleTag(tag)}
                    className={`badge cursor-pointer transition-colors ${form.tags.includes(tag) ? 'badge-black' : 'badge-outline hover:border-gray-400'}`}
                  >{tag}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Content</label>
              <textarea id="thread-content" className="form-input resize-none" rows={8} placeholder="Describe your question in detail..." value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={()=>navigate('/community')} className="btn-outline">Cancel</button>
              <button type="submit" id="submit-thread-btn" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <span className="spinner w-4 h-4 border-white border-t-transparent"/>} Post Question
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
