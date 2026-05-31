import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiShieldLine, RiFileTextLine, RiUserLine, RiListCheck2 } from 'react-icons/ri';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1" style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="page-container py-16 max-w-4xl">
          <div className="text-center mb-12 animate-slide-up">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-3">LEGAL PROTOCOLS</p>
            <h1 className="text-4xl md:text-5xl font-black text-brand-secondary tracking-tight">TERMS OF SERVICE</h1>
            <p className="text-gray-500 mt-3 font-medium">Last updated: May 30, 2026</p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Quick Summary Card */}
            <div className="bg-brand-primary-light p-6 rounded-2xl border border-brand-primary-light/50 flex items-start gap-4">
              <RiShieldLine className="text-3xl text-brand-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-brand-secondary text-base mb-1">PLANTECH TRUST PROTOCOL</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Welcome to Plantaech. By using our agricultural AI diagnostic platform and community portal, you agree to these Terms. We promise to protect your security and deliver diagnostic precision, and we ask that you respect our community and use our service responsibly.
                </p>
              </div>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiUserLine className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">1. ACCEPTANCE & ACCOUNT PROTOCOLS</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                By registering an account and using Plantaech, you certify that you are at least 13 years of age. You are solely responsible for maintaining the confidentiality of your credentials and all active sessions. You agree to provide accurate, verifiable registration details, including email ownership confirmed via our verification OTP protocols.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiFileTextLine className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">2. DIAGNOSTIC SERVICES & LIABILITY LIMITS</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                Plantaech provides advanced machine-learning-driven tomato leaf disease diagnostics. While our AI model strives for maximum accuracy, all reports, prescriptions, and immediate action plans are delivered for informational and educational purposes. We highly recommend consulting a qualified local agronomist or agricultural extension officer before making high-risk decisions.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RiListCheck2 className="text-2xl text-brand-accent" />
                <h2 className="text-xl font-bold text-brand-secondary">3. COMMUNITY CONDUCT GUIDELINES</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">
                Our forum is a collaborative environment for farmers, agricultural students, and experts. By posting threads and comments, you agree not to post any spam, inappropriate media, harassment, or intentionally misleading information. Plantaech administrators reserve absolute rights to moderate, ban accounts, or permanently delete threads and posts that violate these community standards.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-brand-secondary">4. DANGER ZONE: ACCOUNT DELETION</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                In compliance with privacy mandates, you possess absolute authority to permanently delete your account at any time via your Profile Settings. Upon account deletion, all personal data, forum posts, comments, and reports will be irreversibly erased from our active databases, and diagnostic history logs will be anonymized.
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
