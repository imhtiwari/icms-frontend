import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Building,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';

const UserDashboard = () => {
  const { user, api } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  
  // Strike system information
  const [userStrikeInfo, setUserStrikeInfo] = useState({
    strikeCount: 0,
    isBanned: false,
    banReason: null,
    lastStrikeDate: null,
    complaintBannedUntil: null,
    canSubmitComplaints: true,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch fresh data on component mount
    fetchDashboardData();
    
    // Set up periodic refresh for user data (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchUserStrikeInfo();
    }, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchUserStrikeInfo = async () => {
    try {
      // Get current user info from backend
      const response = await api.get('/users/profile');
      const userData = response.data;
      
      setUserStrikeInfo({
        strikeCount: userData.strikeCount || 0,
        isBanned: userData.isBanned || false,
        banReason: userData.banReason || null,
        lastStrikeDate: userData.lastStrikeDate || null,
        complaintBannedUntil: userData.complaintBannedUntil || null,
        canSubmitComplaints: userData.canSubmitComplaints !== false,
      });
    } catch (error) {
      console.error('Error fetching user strike info:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from backend API
      setLoading(true);
      
      // Fetch user strike info
      await fetchUserStrikeInfo();
      
      const complaintsResponse = await api.get('/complaints/my');
      const complaintsData = complaintsResponse.data.content || complaintsResponse.data || [];
      setComplaints(complaintsData);

      const statsResponse = await api.get('/complaints/stats');
      const statsData = statsResponse.data;
      setStats(statsData);

      const recentResponse = await api.get('/complaints/recent');
      const recentData = Array.isArray(recentResponse.data) ? recentResponse.data : 
                          (recentResponse.data.content || recentResponse.data || []);
      setRecentComplaints(recentData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty state on error
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
      });
      setRecentComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'URGENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.total,
      icon: FileText,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Activity,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-500">
              Manage your infrastructure complaints efficiently
            </p>
          </div>
          <div className="hidden lg:block">
            <Building className="h-16 w-16 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <button
            onClick={() => fetchUserStrikeInfo()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userStrikeInfo.canSubmitComplaints ? (
            <Link
              to="/complaints/new"
              className="flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Complaint
            </Link>
          ) : (
            <div className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed border border-gray-200">
              <Plus className="mr-2 h-5 w-5" />
              Complaint Filing Paused
            </div>
          )}
          <Link
            to="/complaints"
            className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <FileText className="mr-2 h-5 w-5" />
            View All Complaints
          </Link>
          <Link
            to="/profile"
            className="flex items-center justify-center px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Users className="mr-2 h-5 w-5" />
            Update Profile
          </Link>
        </div>
      </div>
      
      {/* Strike / ban warnings */}
      {userStrikeInfo.isBanned && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Account suspended</h3>
              <p className="text-red-700 mb-2">
                Your account has been disabled by an administrator.
              </p>
              {userStrikeInfo.banReason && (
                <p className="text-red-600">
                  <strong>Reason:</strong> {userStrikeInfo.banReason}
                </p>
              )}
              <p className="text-red-500 text-sm mt-4">
                Please contact support if you believe this is an error.
              </p>
            </div>
          </div>
        </div>
      )}

      {!userStrikeInfo.isBanned &&
        userStrikeInfo.complaintBannedUntil &&
        new Date(userStrikeInfo.complaintBannedUntil) > new Date() && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  Complaint filing paused (three strikes)
                </h3>
                <p className="text-orange-800 mb-2">
                  You cannot submit new complaints until{' '}
                  {new Date(userStrikeInfo.complaintBannedUntil).toLocaleString()}.
                </p>
                {userStrikeInfo.banReason && (
                  <p className="text-orange-700 text-sm">{userStrikeInfo.banReason}</p>
                )}
              </div>
            </div>
          </div>
        )}
      
      {userStrikeInfo.strikeCount > 0 &&
        !userStrikeInfo.isBanned &&
        !(
          userStrikeInfo.complaintBannedUntil &&
          new Date(userStrikeInfo.complaintBannedUntil) > new Date()
        ) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Warning: {userStrikeInfo.strikeCount} Strike{userStrikeInfo.strikeCount > 1 ? 's' : ''}</h3>
              <p className="text-yellow-700 mb-2">
                You have {userStrikeInfo.strikeCount} strike{userStrikeInfo.strikeCount > 1 ? 's' : ''}. At three strikes you cannot file new complaints for 30 days.
              </p>
              <p className="text-yellow-600 text-sm">
                Please ensure your complaints are legitimate and accurate.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <Link
            to="/complaints"
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            View all →
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentComplaints.map((complaint) => (
            <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/complaints/${complaint.id}`}
                  className="ml-4 text-red-600 hover:text-red-500"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
