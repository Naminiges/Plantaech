import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import AdminLayout from '../../components/layout/AdminLayout';
import { RiUserLine, RiLeafLine, RiFileList2Line, RiFlag2Line } from 'react-icons/ri';
import toast from 'react-hot-toast';

const STAT_CARDS = [
  { key: 'totalUsers',     label: 'Total Users',      icon: RiUserLine },
  { key: 'totalDiagnoses', label: 'Total Diagnoses',  icon: RiLeafLine },
  { key: 'totalThreads',   label: 'Forum Posts',      icon: RiFileList2Line },
  { key: 'pendingReports', label: 'Pending Reports',  icon: RiFlag2Line },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? <div className="flex justify-center py-20"><div className="spinner w-8 h-8"/></div> : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                  <Icon className="text-gray-300 text-lg" />
                </div>
                <p className="text-3xl font-black">{stats?.[key]?.toLocaleString() ?? '—'}</p>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">Welcome to the Plantaech Admin Panel. Use the sidebar to manage users, forum posts, and reports.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
