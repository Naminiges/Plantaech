import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiShieldLine, RiListCheck2, RiUserLine, RiShieldKeyholeLine } from 'react-icons/ri';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1" style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="page-container py-16 max-w-4xl">
          <div className="text-center mb-12 animate-slide-up">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-3">DATA TRUST</p>
            <h1 className="text-4xl md:text-5xl font-black text-brand-secondary tracking-tight">PRIVACY POLICY</h1>
            <p className="text-gray-500 mt-3 font-medium">Last updated: May 30, 2026</p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>

            {/* Encryption Trust Banner */}
            <div className="bg-brand-primary-light p-6 rounded-2xl border border-brand-primary-light/50 flex items-start gap-4">
              <RiShieldKeyholeLine className="text-3xl text-brand-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-brand-secondary text-base mb-1">PRIVACY FIRST IN AGRICULTURE</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  At Plantaech, we believe agricultural data integrity and personal privacy go hand-in-hand. We deploy highly secure databases and strict tokenization protocols to protect your personal identity and crop assets.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiListCheck2 className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">1. WHAT WE COLLECT</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                We collect information necessary to deliver diagnostic precisions and establish community profiles:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm pl-4 space-y-2">
                <li><strong>Profile Details</strong>: Name, email address, phone number, and avatar image.</li>
                <li><strong>Diagnostic Data</strong>: Uploaded crop leaf images, diagnostic results, and metadata.</li>
                <li><strong>Forum Activities</strong>: Threads, comments, and reports you file.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiShieldLine className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">2. SECURING & SHARING YOUR DATA</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                Plantaech utilizes Supabase Postgres security structures and JWT-secured tokens to safeguard all profile sessions. Your passwords are hashed using high-level hashing. We never sell, rent, or distribute your personal details, diagnostic logs, or crop locations to third-party commercial entities.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiUserLine className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">3. YOUR PRIVACY CONTROLS & RIGHTS</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                You retain complete, legally protected control over your details. Via your settings dashboard, you can:
              </p>
              <ul className="list-disc list-inside text-gray-600 text-sm pl-4 space-y-2">
                <li>Access, edit, or update your profile details and avatar at any time.</li>
                <li>Request account deletion which triggers our automated deletion system to securely and permanently erase your personal identification details, forum posts, and comment logs.</li>
              </ul>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
