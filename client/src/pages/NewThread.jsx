import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { forumService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiArrowLeftLine, RiImageAddLine, RiCloseLine } from 'react-icons/ri';
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
  const fileRef = useRef();
  const [form, setForm]         = useState({ title: '', content: '', category: 'umum', tags: [] });
  const [image, setImage]       = useState(null);   // File object
  const [preview, setPreview]   = useState(null);   // data URL for preview
  const [loading, setLoading]   = useState(false);

  const toggleTag = (tag) => setForm(f => ({
    ...f,
    tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
  }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setImage(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())   { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    setLoading(true);
    try {
      const { data } = await forumService.createThread(form, image || undefined);
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
          <button onClick={() => navigate('/community')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-accent mb-6 transition-colors font-medium">
            <RiArrowLeftLine /> Back to Community
          </button>
          
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-8 border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-black text-brand-secondary">ASK A QUESTION</h1>
              <p className="text-gray-500 font-medium mt-2">Get help from the community by providing details about your plant issue.</p>
            </div>
            
            <form onSubmit={handleSubmit} id="new-thread-form" className="space-y-6">

            {/* Title */}
            <div>
              <label className="form-label">Title</label>
              <input id="thread-title" type="text" className="form-input" placeholder="What's your question?"
                value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>

            {/* Category */}
            <div>
              <label className="form-label">Category</label>
              <select id="thread-category" className="form-input" value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">Tags <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_TAGS.map(tag => (
                  <button key={tag} type="button" id={`tag-${tag}`}
                    onClick={() => toggleTag(tag)}
                    className={`badge cursor-pointer transition-all duration-200 ${form.tags.includes(tag) ? 'bg-brand-secondary text-white border-brand-secondary shadow-md' : 'badge-outline hover:border-brand-accent hover:text-brand-accent'}`}
                  >{tag}</button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="form-label">Content</label>
              <textarea id="thread-content" className="form-input resize-none" rows={8}
                placeholder="Describe your question in detail..."
                value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} />
            </div>

            {/* Image upload */}
            <div>
              <label className="form-label">Attach Image <span className="text-gray-400 font-normal">(optional, max 5 MB)</span></label>
              {preview ? (
                <div className="relative mt-2 w-full border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <img src={preview} alt="Preview" className="w-full max-h-[30rem] object-cover" />
                  <button type="button" onClick={removeImage}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                    <RiCloseLine className="text-xl" />
                  </button>
                </div>
              ) : (
                <button type="button" id="attach-image-btn"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 w-full border-2 border-dashed border-gray-200 hover:border-brand-accent hover:bg-brand-primary-light rounded-2xl py-12 flex flex-col items-center gap-3 text-gray-400 hover:text-brand-secondary transition-all">
                  <RiImageAddLine className="text-4xl" />
                  <span className="text-sm font-medium">Click to browse or drag and drop an image</span>
                  <span className="text-xs text-gray-400 font-normal">PNG, JPG, WEBP up to 5MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleImageChange} id="thread-image-input" />
            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
              <button type="button" onClick={() => navigate('/community')} className="btn-outline px-8 rounded-full">Cancel</button>
              <button type="submit" id="submit-thread-btn" disabled={loading}
                className="btn-primary rounded-full px-8 flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading && <span className="spinner w-5 h-5 border-white border-t-transparent"/>} Post Question
              </button>
            </div>
          </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
