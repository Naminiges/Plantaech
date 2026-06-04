import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { RiShieldKeyholeLine, RiChat1Line, RiShieldLine, RiEditLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { miscService } from '../services';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill out all fields');
      return;
    }
    setLoading(true);
    
    try {
      await miscService.sendContact(form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1" style={{ paddingTop: 'var(--nav-height)' }}>
        <section className="page-container py-16 max-w-5xl">
          <div className="text-center mb-12 animate-slide-up">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-3">GET IN TOUCH</p>
            <h1 className="text-4xl md:text-5xl font-black text-brand-secondary tracking-tight">CONTACT PLANTAECH</h1>
            <p className="text-gray-500 mt-3 font-medium">Have questions, feedback, or agricultural inquiries? We are here to help.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8 items-start animate-slide-up" style={{ animationDelay: '0.1s' }}>
            
            {/* Left: Contact Info (2 Cols) */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-brand-secondary uppercase tracking-wide">Contact Details</h3>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-accent flex-shrink-0">
                    <RiShieldKeyholeLine className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-0.5">Email Support</p>
                    <a href="mailto:fathur.6913@gmail.com" className="text-sm font-medium text-brand-secondary hover:text-brand-accent transition-colors">fathur.6913@gmail.com</a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-accent flex-shrink-0">
                    <RiChat1Line className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-0.5">Hotline</p>
                    <p className="text-sm font-medium text-brand-secondary">+62 813-9675-7694</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-accent flex-shrink-0">
                    <RiShieldLine className="text-lg" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-medium text-brand-secondary leading-relaxed">
                      Medan, Sumatera Utara, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form (3 Cols) */}
            <div className="md:col-span-3">
              <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-brand-secondary uppercase tracking-wide mb-2">Send a Message</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Your Name</label>
                      <input type="text" className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Subject</label>
                    <input type="text" className="form-input" placeholder="Inquiry about AI diagnosis..." value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
                  </div>

                  <div>
                    <label className="form-label">Message</label>
                    <textarea rows="5" className="form-input py-3 resize-none" placeholder="Type your message here..." value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}></textarea>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary rounded-full px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 w-full disabled:opacity-50">
                    {loading ? (
                      <span className="spinner w-4 h-4 border-white border-t-transparent" />
                    ) : (
                      <>
                        <RiEditLine className="text-base" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
