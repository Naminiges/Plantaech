import { NavLink, Link } from 'react-router-dom';
import { RiDashboardLine, RiUserLine, RiFlag2Line, RiFileList2Line, RiArrowLeftLine, RiPlantLine } from 'react-icons/ri';

const NAV = [
  { to: '/admin',         label: 'Dashboard', icon: RiDashboardLine, end: true },
  { to: '/admin/users',   label: 'Users',     icon: RiUserLine },
  { to: '/admin/posts',   label: 'Posts',     icon: RiFileList2Line },
  { to: '/admin/reports', label: 'Reports',   icon: RiFlag2Line },
];

export default function AdminLayout({ children, title }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-40">
        <div className="px-4 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 font-black text-sm tracking-tight text-black">
            <RiPlantLine />
            PLANTAECH
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="text-base" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link to="/" className="admin-nav-item text-gray-500">
            <RiArrowLeftLine /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
