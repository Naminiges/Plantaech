import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosisService } from '../../services';
import { RiUpload2Line, RiImageLine, RiCloseLine, RiScan2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function UploadArea() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) { inputRef.current?.click(); return; }
    setLoading(true);
    const toastId = toast.loading('Analyzing tomato leaf...');
    try {
      const { data } = await diagnosisService.upload(file);
      toast.success('Analysis complete!', { id: toastId });
      navigate(`/diagnosis/${data.diagnosis.id}`, { state: { diagnosis: data.diagnosis } });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone / preview */}
      <div
        className={`relative border-2 border-dashed transition-colors duration-200 cursor-pointer ${dragging ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'}`}
        style={{ aspectRatio: '4/3', minHeight: 220 }}
        onClick={() => !preview && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <RiCloseLine className="text-sm" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <RiImageLine className="text-3xl" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider">TOMATO LEAF SCAN AREA</p>
            <p className="text-xs text-gray-300">Click or drag & drop an image of a tomato leaf</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />

      <button
        id="upload-plant-btn"
        onClick={handleAnalyze}
        disabled={loading}
        className="btn-primary btn-lg w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading
          ? <><span className="spinner w-4 h-4 border-white border-t-transparent" /> Analyzing...</>
          : <>{file ? <RiScan2Line className="text-lg" /> : <RiUpload2Line className="text-lg" />} {file ? 'ANALYZE LEAF' : 'UPLOAD TOMATO LEAF'}</>
        }
      </button>
    </div>
  );
}
