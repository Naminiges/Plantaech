import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Diagnosis    from './pages/Diagnosis';
import History      from './pages/History';
import Community    from './pages/Community';
import ThreadDetail from './pages/ThreadDetail';
import NewThread    from './pages/NewThread';
import Profile      from './pages/Profile';
import Terms        from './pages/Terms';
import Privacy      from './pages/Privacy';
import Contact      from './pages/Contact';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminPosts     from './pages/admin/Posts';
import AdminReports   from './pages/admin/Reports';
import AdminDiseases  from './pages/admin/Diseases';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '4px', border: '1px solid #e2e2e2' },
            success: { iconTheme: { primary: '#111', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/"          element={<Landing />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<ThreadDetail />} />
          <Route path="/diagnosis/result" element={<Diagnosis />} />
          <Route path="/diagnosis/:id" element={<Diagnosis />} />
          <Route path="/terms"     element={<Terms />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/contact"   element={<Contact />} />

          {/* Auth-protected routes */}
          <Route path="/history"       element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/community/new" element={<ProtectedRoute><NewThread /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/posts"     element={<AdminRoute><AdminPosts /></AdminRoute>} />
          <Route path="/admin/reports"   element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/diseases"  element={<AdminRoute><AdminDiseases /></AdminRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><p className="text-6xl font-black mb-4">404</p><p className="text-gray-500">Page not found.</p></div></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
