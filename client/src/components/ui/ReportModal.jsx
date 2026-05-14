import { useState } from 'react';
import { RiCloseLine, RiFlag2Line } from 'react-icons/ri';
import { reportService } from '../../services';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const REASONS = [
  { value: 'spam',           label: 'Spam' },
  { value: 'harassment',     label: 'Harassment or bullying' },
  { value: 'inappropriate',  label: 'Inappropriate content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other',          label: 'Other' },
];

export default function ReportModal({ isOpen, onClose, threadId, commentId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason]   = useState('');
  const [desc, setDesc]       = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-sm w-full shadow-modal animate-slide-up text-center">
          <RiFlag2Line className="text-3xl text-gray-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-2">Login Required</h3>
          <p className="text-sm text-gray-500 mb-5">You need to be logged in to report content.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="btn-outline btn-sm">Cancel</button>
            <button onClick={() => { onClose(); navigate('/login'); }} className="btn-primary btn-sm">Log in</button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason');
    setLoading(true);
    try {
      await reportService.create({ reason, description: desc, thread_id: threadId, comment_id: commentId });
      toast.success('Report submitted. Thank you!');
      onClose();
      setReason('');
      setDesc('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <RiFlag2Line className="text-red-500" />
            <h3 className="font-bold text-base">Report Content</h3>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm !border-none p-1"><RiCloseLine className="text-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Reason</label>
            <div className="space-y-2">
              {REASONS.map(r => (
                <label key={r.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio" name="reason" value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-black"
                  />
                  <span className="text-sm group-hover:text-black transition-colors">{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="form-label">Additional Details (Optional)</label>
            <textarea
              value={desc} onChange={e => setDesc(e.target.value)}
              className="form-input resize-none" rows={3}
              placeholder="Describe the issue..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-outline btn-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-danger btn-sm disabled:opacity-50">
              {loading ? <span className="spinner w-3 h-3" /> : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
