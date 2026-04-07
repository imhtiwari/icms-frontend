import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Layout from './components/Layout';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';

// Dashboard Components
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';

// Complaint Components
import ComplaintList from './pages/complaints/ComplaintList';
import CreateComplaint from './pages/complaints/CreateComplaint';
import ComplaintDetail from './pages/complaints/ComplaintDetail';
import EditComplaint from './pages/complaints/EditComplaint';
import ComplaintsLayout from './pages/complaints/ComplaintsLayout';
import ComplaintsHome from './pages/complaints/ComplaintsHome';
import ComplaintCategoryPage from './pages/complaints/ComplaintCategoryPage';

// Worker Components
import WorkersList from './pages/workers/WorkersList';
import WorkerDetail from './pages/workers/WorkerDetail';

// User Management Components
import UserManagement from './pages/admin/UserManagement.js';
import CreateUser from './pages/admin/CreateUser';
import EditUser from './pages/admin/EditUser';
import Analytics from './pages/admin/Analytics';
import AdminStrikeManagement from './components/AdminStrikeManagement';
import ProfessionalBanManagement from './components/ProfessionalBanManagement';

// Profile Component
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard Routes */}
              <Route path="dashboard" element={<RoleBasedDashboard />} />
              
              {/* Complaint Routes */}
              <Route path="complaints" element={<ComplaintsLayout />}>
                <Route index element={<ComplaintsHome />} />
                <Route path="category/:categoryKey" element={<ComplaintCategoryPage />} />
                <Route path="new" element={<CreateComplaint />} />
                <Route path=":id" element={<ComplaintDetail />} />
                <Route path=":id/edit" element={<EditComplaint />} />
              </Route>
              
              {/* Workers Route */}
              <Route path="workers" element={<WorkersList />} />
              <Route path="workers/:id" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><WorkerDetail /></ProtectedRoute>} />
              
              {/* Profile Route */}
              <Route path="profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><UserManagement /></ProtectedRoute>} />
              <Route path="admin/users/new" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><CreateUser /></ProtectedRoute>} />
              <Route path="admin/users/:id/edit" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><EditUser /></ProtectedRoute>} />
              <Route path="admin/analytics" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><Analytics /></ProtectedRoute>} />
              <Route path="admin/strike-management" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><AdminStrikeManagement /></ProtectedRoute>} />
              <Route path="admin/professional-ban" element={<ProtectedRoute roles={['ADMIN', 'OWNER']}><ProfessionalBanManagement /></ProtectedRoute>} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#111827',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '16px 24px',
                fontSize: '14px',
                fontWeight: '600',
              },
              success: {
                duration: 3000,
                style: {
                  borderLeft: '6px solid #be123c', // primary-700
                },
                iconTheme: {
                  primary: '#be123c',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  borderLeft: '6px solid #ef4444', // red-500
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Role-based dashboard component
function RoleBasedDashboard() {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'OWNER':
      return <OwnerDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'USER':
    default:
      return <UserDashboard />;
  }
}

export default App;
