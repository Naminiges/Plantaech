import { Link } from 'react-router-dom';
import { RiPlantLine } from 'react-icons/ri';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="page-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-black tracking-tight">
            <RiPlantLine />
            PLANTAECH
          </div>
          <p className="text-xs text-gray-400">© {year} Plantaech. CC26-PSU258 — DBS Foundation Coding Camp 2026.</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link to="/terms"   className="hover:text-black transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <a href="mailto:plantaech@example.com" className="hover:text-black transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
