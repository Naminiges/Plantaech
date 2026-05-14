import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiPlantLine, RiMenuLine, RiCloseLine, RiUserLine, RiLogoutBoxLine, RiShieldLine } from 'react-icons/ri';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200" style={{ height: 'var(--nav-height)' }}>
      <div className="page-container h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-black text-lg tracking-tight">
          <RiPlantLine className="text-black text-xl" />
          PLANTAECH
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/"          end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/community"     className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Community</NavLink>
          {isAuthenticated && (
            <NavLink to="/history"   className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>History</NavLink>
          )}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors"
              >
                {user?.avatar
                  ? <img src={user.avatar} className="w-7 h-7 rounded-full object-cover border border-gray-200" alt="avatar" />
                  : <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">{user?.first_name?.[0]}</div>
                }
                <span>{user?.first_name}</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-card-hover animate-slide-down z-50">
                  <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                    <RiUserLine /> Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-black font-medium">
                      <RiShieldLine /> Admin Panel
                    </Link>
                  )}
                  <hr className="border-gray-100" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <RiLogoutBoxLine /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary btn-sm">LOGIN</Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <RiCloseLine className="text-xl" /> : <RiMenuLine className="text-xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-down">
          <div className="page-container py-4 flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className="text-sm font-medium">Home</NavLink>
            <NavLink to="/community" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Community</NavLink>
            {isAuthenticated && <NavLink to="/history" onClick={() => setMenuOpen(false)} className="text-sm font-medium">History</NavLink>}
            {isAuthenticated && <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Profile</NavLink>}
            {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium">Admin Panel</NavLink>}
            {isAuthenticated
              ? <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm font-medium text-red-600 text-left">Log out</button>
              : <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary w-fit">LOGIN</Link>
            }
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropOpen && <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />}
    </nav>
  );
}
