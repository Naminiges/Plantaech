import UploadArea from '../components/ui/UploadArea';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiCameraLine, RiCpuLine, RiMedicineBottleLine } from 'react-icons/ri';

const PROTOCOLS = [
  {
    num: '01',
    title: 'CAPTURE EVIDENCE',
    icon: RiCameraLine,
    desc: 'Take a high-resolution photograph of the symptomatic area. Ensure good lighting and focus on the affected leaf for maximum diagnostic accuracy.',
  },
  {
    num: '02',
    title: 'CLINICAL PROCESSING',
    icon: RiCpuLine,
    desc: 'Our model compares your specimen against a global database of known agricultural pathogens and stressors.',
  },
  {
    num: '03',
    title: 'PRESCRIPTION',
    icon: RiMedicineBottleLine,
    desc: 'Receive a detailed pathology report and immediate treatment protocols to arrest further crop loss.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1" style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="page-container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div className="animate-slide-up">
              <h1 className="heading-hero mb-6 text-balance">
                DIAGNOSTIC<br />
                PRECISION FOR<br />
                AGRICULTURE.
              </h1>
              <p className="text-gray-500 text-base max-w-md mb-8 leading-relaxed">
                Identify plant diseases instantly using our high-contrast clinical analysis engine.
                Upload a clear image of the affected leaf to begin.
              </p>
              {/* Upload integrated in hero */}
              <div className="max-w-xs">
                <UploadArea />
              </div>
            </div>

            {/* Right — Visual Analysis Area (desktop only) */}
            <div className="hidden md:block animate-fade-in">
              <div className="border-2 border-black relative" style={{ aspectRatio: '1', maxWidth: 420 }}>
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black -mt-px -ml-px" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black -mt-px -mr-px" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black -mb-px -ml-px" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black -mb-px -mr-px" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="border-2 border-dashed border-gray-300 p-6 rounded">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">VISUAL ANALYSIS AREA</p>
                  <p className="text-xs text-gray-300">Upload an image to begin analysis</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Section */}
        <section className="border-t border-gray-200 py-16">
          <div className="page-container">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">THE PROTOCOL</p>
            <div className="grid md:grid-cols-3 gap-8">
              {PROTOCOLS.map(({ num, title, icon: Icon, desc }) => (
                <div key={num} className="animate-fade-in">
                  <div className="step-number mb-4">{num}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="text-base" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
