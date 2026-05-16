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
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — Text */}
            <div className="animate-slide-up pt-4">
              <h1 className="heading-hero mb-6 text-balance text-brand-secondary">
                DIAGNOSTIC<br />
                PRECISION FOR<br />
                AGRICULTURE.
              </h1>
              <p className="text-gray-600 text-lg max-w-md mb-10 leading-relaxed font-medium">
                Identify plant diseases instantly using our high-contrast clinical analysis engine.
                Upload a clear image of the affected leaf to begin.
              </p>
              {/* Call to action button that scrolls to upload */}
              <a href="#upload-section" className="btn-primary btn-lg rounded-full inline-flex">
                START DIAGNOSIS
              </a>
            </div>

            {/* Right — Visual Analysis Area (desktop only) */}
            <div className="hidden md:block animate-fade-in relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500">
                <img src="/images/ai-scan.png" alt="AI scanning leaf" className="w-full h-auto object-cover aspect-square" />
                {/* Decorative glowing overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-secondary/30 to-transparent mix-blend-overlay"></div>
                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-brand-accent animate-pulse"></div>
                   <span className="text-sm font-bold text-brand-secondary tracking-wider">SYSTEM READY</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Upload Section */}
        <section id="upload-section" className="py-20 bg-brand-primary-light">
          <div className="page-container max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="heading-section text-brand-secondary mb-4">ANALYZE YOUR PLANT</h2>
              <p className="text-gray-600 font-medium">Upload a clear photo of the symptomatic leaf. Our AI will handle the rest.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <UploadArea />
            </div>
          </div>
        </section>

        {/* Protocol Section */}
        <section className="bg-white border-t border-gray-100 py-24">
          <div className="page-container">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-3">THE PROTOCOL</p>
              <h2 className="heading-section text-brand-secondary">HOW IT WORKS</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {PROTOCOLS.map(({ num, title, icon: Icon, desc }) => (
                <div key={num} className="card-hover p-8 flex flex-col items-start bg-brand-primary-light/50">
                  <div className="w-14 h-14 rounded-2xl bg-brand-accent/20 flex items-center justify-center mb-6 shadow-sm border border-brand-accent/10">
                    <span className="font-black text-xl text-brand-secondary">{num}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="text-2xl text-brand-accent" />
                    <h3 className="font-bold text-lg text-brand-secondary tracking-wide">{title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{desc}</p>
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
