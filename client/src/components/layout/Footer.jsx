import { Link } from 'react-router-dom';
import { RiPlantLine } from 'react-icons/ri';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brand-secondary-light/30 bg-brand-secondary mt-auto">
      <div className="page-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
            <RiPlantLine className="text-brand-accent text-2xl" />
            PLANTAECH
          </div>
          <p className="text-sm text-white/50">© {year} Plantaech. CC26-PSU258 — DBS Foundation Coding Camp.</p>
          <div className="flex items-center gap-6 text-sm font-medium text-white/70">
            <Link to="/terms"   className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <a href="mailto:plantaech@example.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
