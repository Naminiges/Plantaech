import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { diagnosisService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiAlertLine, RiCalendarLine, RiDownload2Line, RiShareLine, RiCameraLine } from 'react-icons/ri';
import { exportDiagnosisPdf } from '../utils/exportPdf';
import toast from 'react-hot-toast';

const SEVERITY_BADGE = { healthy: 'badge-success', mild: 'badge-warning', moderate: 'badge-warning', severe: 'badge-danger' };

export default function Diagnosis() {
  const { id } = useParams();
  const location = useLocation();
  const [diagnosis, setDiagnosis] = useState(location.state?.diagnosis || null);
  const [loading, setLoading]     = useState(!diagnosis);

  useEffect(() => {
    if (!diagnosis && id) {
      diagnosisService.getDiagnosis(id)
        .then(({ data }) => setDiagnosis(data.diagnosis))
        .catch(() => toast.error('Failed to load diagnosis'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center" style={{paddingTop:'var(--nav-height)'}}>
        <div className="spinner w-8 h-8" />
      </div>
    </div>
  );

  if (!diagnosis) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{paddingTop:'var(--nav-height)'}}>
        <p className="text-gray-500">Diagnosis not found.</p>
        <Link to="/" className="btn-primary btn-sm">Go Home</Link>
      </div>
    </div>
  );

  const severity = diagnosis.severity;
  const isHealthy = severity === 'healthy';
  const isNotPlant = !severity;
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000';
  const imageSrc = diagnosis.image_signed_url
    || (diagnosis.image_url
      ? (diagnosis.image_url.startsWith('http') ? diagnosis.image_url : `${API_BASE}${diagnosis.image_url}`)
      : null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12">
          {/* Breadcrumb */}
          <p className="text-xs text-gray-400 mb-6">
            <Link to="/" className="hover:text-black">Home</Link> &rsaquo; <span>Analysis Results</span>
          </p>

          <h1 className="text-3xl font-black text-brand-secondary mb-10 uppercase">Analysis Results</h1>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left — Image */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-3xl shadow-md aspect-square flex items-center justify-center overflow-hidden relative group">
                {imageSrc
                  ? <img src={imageSrc}
                      alt="Analyzed tomato leaf" className="w-full h-full object-cover" />
                  : <div className="text-gray-300 text-center"><p className="text-4xl mb-2">🌿</p><p className="text-xs">No image available</p></div>
                }
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center flex flex-col items-center justify-center">
                  <p className="text-brand-accent font-bold uppercase tracking-widest mb-1.5 text-[10px]">Status</p>
                  <span className={`badge ${isNotPlant ? 'bg-gray-400 text-white border-gray-400' : severity === 'healthy' ? 'bg-brand-accent text-white border-brand-accent' : severity === 'mild' ? 'bg-amber-500 text-white border-amber-500' : 'bg-red-500 text-white border-red-500'} scale-90 origin-center`}>{isNotPlant ? 'unrecognized' : severity}</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-brand-accent font-bold uppercase tracking-widest mb-1.5 text-[10px]">Analyzed</p>
                  <p className="font-bold text-brand-secondary">{new Date(diagnosis.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Right — Results */}
            <div className="space-y-8 animate-slide-up">

              {/* Disease name */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary-light rounded-bl-full opacity-50 -z-10"></div>
                <p className="text-xs text-brand-accent font-bold uppercase tracking-widest mb-3">{isNotPlant ? 'Result' : 'Identified Pathogen'}</p>
                <h2 className="text-3xl sm:text-4xl font-black text-brand-secondary uppercase mb-2 leading-tight">{diagnosis.disease_name}</h2>
                {diagnosis.scientific_name && (
                  <p className="text-lg text-gray-500 italic font-medium">{diagnosis.scientific_name}</p>
                )}
                {severity && !isHealthy && (
                  <span className={`badge mt-4 text-sm px-4 py-1.5 ${severity === 'mild' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
                  </span>
                )}
              </div>

              {/* Action grid — only for real disease diagnoses */}
              {!isHealthy && !isNotPlant && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2.5 mb-3 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <RiAlertLine className="text-lg" />
                      </div>
                      <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Immediate Action</p>
                    </div>
                    <p className="text-sm text-amber-900/80 leading-relaxed relative z-10">{diagnosis.immediate_action}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2.5 mb-3 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <RiCalendarLine className="text-lg" />
                      </div>
                      <p className="text-xs font-black text-blue-800 uppercase tracking-widest">Treatment Plan</p>
                    </div>
                    <p className="text-sm text-blue-900/80 leading-relaxed relative z-10">{diagnosis.treatment_plan}</p>
                  </div>
                </div>
              )}

              {isHealthy && (
                <div className="bg-brand-primary-light border border-brand-accent p-6 rounded-3xl shadow-sm">
                  <p className="text-lg font-black text-brand-secondary mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm">✓</span> Plant is Healthy
                  </p>
                  <p className="text-sm text-brand-secondary/80 font-medium">{diagnosis.immediate_action}</p>
                </div>
              )}

              {isNotPlant && (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-lg font-black text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-sm">?</span> Not Recognized
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{diagnosis.immediate_action}</p>
                  {diagnosis.treatment_plan && (
                    <p className="text-sm text-gray-500 mt-2">{diagnosis.treatment_plan}</p>
                  )}
                </div>
              )}

              {/* Export banner */}
              <div className="bg-brand-secondary border border-brand-secondary p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-10 text-brand-primary-light/10 text-9xl">🌿</div>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-primary-light mb-1.5">Expert Consultation Required?</p>
                  <p className="text-sm text-gray-300">Download Comprehensive PDF Report</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 relative z-10">
                  <button onClick={() => exportDiagnosisPdf(diagnosis)} className="btn bg-white text-brand-secondary hover:bg-brand-primary-light hover:text-brand-secondary rounded-full px-6 py-2.5 flex items-center gap-2 text-sm font-bold transition-colors shadow-md">
                    <RiDownload2Line className="text-lg" /> EXPORT DATA
                  </button>
                </div>
              </div>

              {/* Start New Diagnosis Button */}
              <div className="flex justify-end pt-2">
                <Link to="/" className="btn-primary rounded-full px-8 py-3 flex items-center gap-2 font-bold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all">
                  <RiCameraLine className="text-xl" /> NEW DIAGNOSIS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
