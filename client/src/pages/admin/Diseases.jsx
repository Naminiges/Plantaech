import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const SEVERITY_OPTIONS = [
  { value: '', label: 'None (unrecognized)' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const SEVERITY_BADGE = {
  healthy: 'bg-green-50 text-green-700 border-green-200',
  mild: 'bg-amber-50 text-amber-700 border-amber-200',
  moderate: 'bg-orange-50 text-orange-700 border-orange-200',
  severe: 'bg-red-50 text-red-700 border-red-200',
};

const emptyForm = { class_key: '', disease_name: '', scientific_name: '', severity: '', immediate_action: '', treatment_plan: '' };

export default function AdminDiseases() {
  const [diseases, setDiseases]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);   // disease id or 'new'
  const [form, setForm]           = useState({ ...emptyForm });

  const fetchDiseases = () => {
    setLoading(true);
    adminService.getDiseases()
      .then(r => setDiseases(r.data.diseases))
      .catch(() => toast.error('Failed to load diseases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDiseases(); }, []);

  const openCreate = () => { setForm({ ...emptyForm }); setEditing('new'); };
  const openEdit = (d) => {
    setForm({
      class_key: d.class_key,
      disease_name: d.disease_name,
      scientific_name: d.scientific_name || '',
      severity: d.severity || '',
      immediate_action: d.immediate_action || '',
      treatment_plan: d.treatment_plan || '',
    });
    setEditing(d.id);
  };
  const closeForm = () => { setEditing(null); setForm({ ...emptyForm }); };

  const handleSave = async () => {
    if (!form.class_key.trim() || !form.disease_name.trim()) {
      toast.error('Class key and disease name are required');
      return;
    }
    try {
      if (editing === 'new') {
        await adminService.createDisease(form);
        toast.success('Disease created');
      } else {
        await adminService.updateDisease(editing, form);
        toast.success('Disease updated');
      }
      closeForm();
      fetchDiseases();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteDisease(id);
      toast.success('Disease deleted');
      setDiseases(d => d.filter(x => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Disease Management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{diseases.length} disease{diseases.length !== 1 ? 's' : ''} configured</p>
          <button onClick={openCreate} className="btn-primary btn-sm flex items-center gap-1.5">
            <RiAddLine /> Add Disease
          </button>
        </div>

        {/* Edit / Create Modal */}
        {editing !== null && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeForm}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-lg">{editing === 'new' ? 'Add Disease' : 'Edit Disease'}</h2>
                <button onClick={closeForm} className="btn-ghost p-1.5 rounded-full"><RiCloseLine className="text-lg" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="form-label">Class Key <span className="text-red-400">*</span></label>
                  <input
                    className="form-input w-full"
                    placeholder="e.g. Tomato_Bacterial_spot"
                    value={form.class_key}
                    onChange={e => setForm(f => ({ ...f, class_key: e.target.value }))}
                    disabled={editing !== 'new'}
                  />
                  {editing !== 'new' && <p className="text-xs text-gray-400 mt-1">Class key cannot be changed after creation</p>}
                </div>
                <div>
                  <label className="form-label">Disease Name <span className="text-red-400">*</span></label>
                  <input className="form-input w-full" placeholder="e.g. Bacterial Spot" value={form.disease_name} onChange={e => setForm(f => ({ ...f, disease_name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Scientific Name</label>
                  <input className="form-input w-full" placeholder="e.g. Xanthomonas vesicatoria" value={form.scientific_name} onChange={e => setForm(f => ({ ...f, scientific_name: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Severity</label>
                  <select className="form-input w-full" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                    {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Immediate Action</label>
                  <textarea className="form-input w-full" rows={3} placeholder="Steps to take immediately..." value={form.immediate_action} onChange={e => setForm(f => ({ ...f, immediate_action: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Treatment Plan</label>
                  <textarea className="form-input w-full" rows={3} placeholder="Long-term treatment plan..." value={form.treatment_plan} onChange={e => setForm(f => ({ ...f, treatment_plan: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <button onClick={closeForm} className="btn-outline btn-sm">Cancel</button>
                <button onClick={handleSave} className="btn-primary btn-sm flex items-center gap-1.5">
                  <RiSaveLine /> {editing === 'new' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diseases Table */}
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Key</th>
                <th>Disease Name</th>
                <th>Scientific Name</th>
                <th>Severity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8"><div className="spinner mx-auto" /></td></tr>
              ) : diseases.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No diseases configured. Run the diseases_table.sql migration first.</td></tr>
              ) : diseases.map(d => (
                <tr key={d.id}>
                  <td><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{d.class_key}</code></td>
                  <td className="font-medium">{d.disease_name}</td>
                  <td className="text-gray-500 italic text-sm">{d.scientific_name || '—'}</td>
                  <td>
                    {d.severity ? (
                      <span className={`badge text-xs ${SEVERITY_BADGE[d.severity] || 'badge-outline'}`}>
                        {d.severity}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(d)} className="btn-ghost btn-sm p-1.5 text-xs" title="Edit">
                        <RiEditLine />
                      </button>
                      <button onClick={() => handleDelete(d.id, d.disease_name)} className="btn-ghost btn-sm p-1.5 text-xs text-red-400" title="Delete">
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
