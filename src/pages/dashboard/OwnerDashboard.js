import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  UserPlus,
  Activity,
  Crown,
  ShieldCheck
} from 'lucide-react';

const OwnerDashboard = () => {
  const { user, api } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    totalRegularUsers: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch complaints stats
      const complaintsResponse = await api.get('/complaints/stats');
      const complaintStats = complaintsResponse.data;
      
      // Fetch recent complaints
      const recentResponse = await api.get('/complaints?size=5&sortBy=createdAt&sortDir=desc');
      const recent = recentResponse.data.content || recentResponse.data;
      
      // Fetch user stats
      const userStatsResponse = await api.get('/admin/stats');
      const userStats = userStatsResponse.data;
      
      setStats({
        totalComplaints: complaintStats.totalComplaints || 0,
        pendingComplaints: complaintStats.pendingComplaints || 0,
        inProgressComplaints: complaintStats.inProgressComplaints || 0,
        resolvedComplaints: complaintStats.resolvedComplaints || 0,
        totalUsers: userStats.totalUsers || 0,
        totalAdmins: userStats.totalAdmins || 0,
        totalRegularUsers: userStats.totalRegularUsers || 0,
      });
      
      setRecentComplaints(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning-600" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4 text-success-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'RESOLVED':
        return 'status-resolved';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      case 'URGENT':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <Crown className="h-8 w-8 text-slate-700" />
          <h1 className="text-3xl font-bold text-gray-900">
            Owner Dashboard
          </h1>
        </div>
        <p className="text-gray-500">
          Full system control and oversight for Infrastructure Complaint Management
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/complaints"
          className="card hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
                <FileText className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">All Complaints</p>
              <p className="text-xs text-gray-500">Manage complaints</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="card hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Users className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">User Management</p>
              <p className="text-xs text-gray-500">Manage all users</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users/new"
          className="card hover:shadow-lg transition-shadow duration-200 group"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
                <UserPlus className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Create Admin</p>
              <p className="text-xs text-gray-500">Add new admin</p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComplaints}</p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FileText className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Users className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalAdmins}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Status Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-warning-600" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-lg font-semibold text-warning-600">{stats.pendingComplaints}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <span className="text-lg font-semibold text-red-600">{stats.inProgressComplaints}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success-600" />
                <span className="text-sm text-gray-600">Resolved</span>
              </div>
              <span className="text-lg font-semibold text-success-600">{stats.resolvedComplaints}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">Owners</span>
              </div>
              <span className="text-lg font-semibold text-red-600">{1}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-red-600" />
                <span className="text-sm text-gray-600">Admins</span>
              </div>
              <span className="text-lg font-semibold text-red-600">{stats.totalAdmins}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Regular Users</span>
              </div>
              <span className="text-lg font-semibold text-gray-600">{stats.totalRegularUsers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Link
            to="/complaints"
            className="text-sm text-red-600 hover:text-red-500 font-medium"
          >
            View All
          </Link>
        </div>
        
        {recentComplaints.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No complaints yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{complaint.title}</h3>
                      <span className={`status-badge ${getStatusClass(complaint.status)}`}>
                        {complaint.status.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className={`status-badge ${getPriorityClass(complaint.priority)}`}>
                        {complaint.priority.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <span>By: {complaint.user?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                      {complaint.blockNumber && (
                        <span>Block: {complaint.blockNumber}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(complaint.status)}
                    <Link
                      to={`/complaints/${complaint.id}`}
                      className="text-red-600 hover:text-red-500 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
