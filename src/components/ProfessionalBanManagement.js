import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Activity,
  Search,
  Eye,
  Ban,
  UserCheck
} from 'lucide-react';

const ProfessionalBanManagement = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
  }, [fetchUsers, fetchAnalytics]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/user-management?page=0&size=50');
      setUsers(response.data.content || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/professional-ban/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const evaluateUser = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/professional-ban/evaluate/${userId}`);
      setEvaluation(response.data);
      setSelectedUser(users.find(u => u.id === userId));
    } catch (error) {
      console.error('Error evaluating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeBan = async (userId, action) => {
    try {
      setLoading(true);
      const payload = {
        action: action,
        reason: banReason || `${action} executed by admin`,
        durationDays: banDuration
      };

      await api.post(`/admin/professional-ban/execute/${userId}`, payload);
      
      // Refresh data
      await fetchUsers();
      if (selectedUser?.id === userId) {
        await evaluateUser(userId);
      }
      
      setShowBanModal(false);
      setBanReason('');
      setSelectedUser(null);
      setEvaluation(null);
      
      alert('Ban action executed successfully!');
    } catch (error) {
      console.error('Error executing ban:', error);
      alert('Error executing ban action: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const quickBan = async (userId, type) => {
    try {
      setLoading(true);
      const endpoint = type === 'false-complaint' 
        ? `/admin/professional-ban/false-complaint/${userId}`
        : `/admin/professional-ban/spam/${userId}`;
      
      await api.post(endpoint, {
        reason: `Quick ${type} ban`,
        durationDays: type === 'false-complaint' ? 30 : 7
      });
      
      await fetchUsers();
      alert(`User banned for ${type}!`);
    } catch (error) {
      console.error('Error in quick ban:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const unbanUser = async (userId) => {
    setConfirmAction(() => () => executeUnban(userId));
    setConfirmMessage('Are you sure you want to unban this user?');
    setShowConfirmDialog(true);
  };

  const executeUnban = async (userId) => {
    try {
      setLoading(true);
      await api.post(`/admin/professional-ban/unban/${userId}`, {
        reason: 'Admin unbanned user'
      });
      
      await fetchUsers();
      alert('User unbanned successfully!');
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setConfirmAction(null);
      setConfirmMessage('');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (user) => {
    if (user.isBanned) return 'bg-red-100 text-red-800';
    if (user.strikeCount >= 3) return 'bg-orange-100 text-orange-800';
    if (user.strikeCount > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (user) => {
    if (user.isBanned) return 'Banned';
    if (user.strikeCount >= 3) return 'Strike Limit';
    if (user.strikeCount > 0) return `${user.strikeCount} Strikes`;
    return 'Active';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Ban Management</h1>
        <p className="text-gray-600">Intelligent ban system based on user activity patterns</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bans</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBans}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Bans</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeBans}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">False Complaint Bans</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.falseComplaintBans}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Spam Bans</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.spamBans}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strikes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user)}`}>
                      {getStatusText(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.strikeCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => evaluateUser(user.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Evaluate User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => quickBan(user.id, 'false-complaint')}
                        className="text-orange-600 hover:text-orange-900"
                        title="Ban for False Complaints"
                      >
                        <TrendingDown className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => quickBan(user.id, 'spam')}
                        className="text-purple-600 hover:text-purple-900"
                        title="Ban for Spam"
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                      
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Unban User"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Manual Ban"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Evaluation Modal */}
      {evaluation && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Evaluation: {selectedUser.name}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">False Complaints:</span>
                  <span className="font-medium">{evaluation.falseComplaintCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Spam Score:</span>
                  <span className="font-medium">{evaluation.spamScore}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommended Action:</span>
                  <span className={`font-medium ${
                    evaluation.recommendedAction === 'NO_ACTION' ? 'text-green-600' :
                    evaluation.recommendedAction === 'CONSIDER_UNBAN' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {evaluation.recommendedAction.replace('_', ' ')}
                  </span>
                </div>
                
                {evaluation.reason && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{evaluation.reason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                {evaluation.recommendedAction === 'BAN_FOR_FALSE_COMPLAINTS' && (
                  <button
                    onClick={() => executeBan(selectedUser.id, 'BAN_FOR_FALSE_COMPLAINTS')}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Ban for False Complaints
                  </button>
                )}
                
                {evaluation.recommendedAction === 'BAN_FOR_SPAM' && (
                  <button
                    onClick={() => executeBan(selectedUser.id, 'BAN_FOR_SPAM')}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Ban for Spam
                  </button>
                )}
                
                {evaluation.recommendedAction === 'CONSIDER_UNBAN' && (
                  <button
                    onClick={() => executeBan(selectedUser.id, 'UNBAN')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Unban User
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Ban: {selectedUser.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ban Reason
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Enter ban reason..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ban Duration (days)
                  </label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(parseInt(e.target.value) || 30)}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => executeBan(selectedUser.id, 'MANUAL_BAN')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={!banReason.trim()}
                >
                  Ban User
                </button>
                
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                    setBanReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
              <p className="text-sm text-gray-600 mb-6">{confirmMessage}</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirmAction) {
                      confirmAction();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
                
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                    setConfirmMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalBanManagement;
