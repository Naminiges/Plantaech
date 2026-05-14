import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { diagnosisService } from '../services';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiAlertLine, RiCalendarLine, RiDownload2Line, RiShareLine } from 'react-icons/ri';
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

  const severity = diagnosis.severity || 'mild';
  const isHealthy = severity === 'healthy';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1" style={{paddingTop:'var(--nav-height)'}}>
        <div className="page-container py-12">
          {/* Breadcrumb */}
          <p className="text-xs text-gray-400 mb-6">
            <Link to="/" className="hover:text-black">Home</Link> &rsaquo; <span>Analysis Results</span>
          </p>

          <h1 className="heading-section mb-10">ANALYSIS RESULTS</h1>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left — Image */}
            <div>
              <div className="border border-gray-200 bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                {diagnosis.image_url
                  ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}${diagnosis.image_url}`}
                      alt="Analyzed plant" className="w-full h-full object-cover" />
                  : <div className="text-gray-300 text-center"><p className="text-4xl mb-2">🌿</p><p className="text-xs">No image available</p></div>
                }
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="border border-gray-200 p-3">
                  <p className="text-gray-400 mb-1">CONFIDENCE</p>
                  <p className="font-bold">{diagnosis.confidence?.toFixed(1)}%</p>
                </div>
                <div className="border border-gray-200 p-3">
                  <p className="text-gray-400 mb-1">STATUS</p>
                  <span className={SEVERITY_BADGE[severity] || 'badge-outline'}>{severity}</span>
                </div>
                <div className="border border-gray-200 p-3">
                  <p className="text-gray-400 mb-1">ANALYZED</p>
                  <p className="font-medium">{new Date(diagnosis.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Right — Results */}
            <div className="space-y-6 animate-slide-up">
              {/* Confidence bar */}
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Diagnostic Confidence</p>
                  <p className="text-4xl font-black">{diagnosis.confidence?.toFixed(1)}%</p>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${diagnosis.confidence}%` }} />
                </div>
              </div>

              {/* Disease name */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Identified Pathogen</p>
                <h2 className="text-3xl font-black uppercase mb-1">{diagnosis.disease_name}</h2>
                {diagnosis.scientific_name && (
                  <p className="text-sm text-gray-500 italic">{diagnosis.scientific_name}</p>
                )}
                {!isHealthy && (
                  <span className={`badge mt-2 ${SEVERITY_BADGE[severity]}`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
                  </span>
                )}
              </div>

              {/* Action grid */}
              {!isHealthy && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RiAlertLine className="text-amber-500" />
                      <p className="text-xs font-bold uppercase tracking-wider">Immediate Action</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{diagnosis.immediate_action}</p>
                  </div>
                  <div className="border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <RiCalendarLine className="text-blue-500" />
                      <p className="text-xs font-bold uppercase tracking-wider">Treatment Plan</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{diagnosis.treatment_plan}</p>
                  </div>
                </div>
              )}

              {isHealthy && (
                <div className="border border-green-200 bg-green-50 p-4 rounded">
                  <p className="text-sm font-semibold text-green-700 mb-1">✓ Plant is Healthy</p>
                  <p className="text-xs text-green-600">{diagnosis.immediate_action}</p>
                </div>
              )}

              {/* Export banner */}
              <div className="border border-gray-900 bg-gray-900 text-white p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1">Expert Consultation Required?</p>
                  <p className="text-xs text-gray-400">Download Comprehensive PDF Report</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toast.success('PDF export coming soon!')} className="btn btn-sm border-white text-white hover:bg-white hover:text-black gap-1.5">
                    <RiDownload2Line /> EXPORT DATA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
