import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Ban, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminStrikeManagement = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [strikeCount, setStrikeCount] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const encoded = (email) => encodeURIComponent(email);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const usersData = response.data.content || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStrike = async (userEmail) => {
    try {
      const response = await api.post(`/admin/users/${encoded(userEmail)}/strike`, { strikeCount });
      if (response.data) {
        // Update user in the list
        setUsers(prev => prev.map(user => 
          user.email === userEmail ? { ...response.data } : user
        ));
        alert(`Added ${strikeCount} strike(s) to ${userEmail}`);
      }
    } catch (error) {
      console.error('Error adding strike:', error);
    }
  };

  const removeStrike = async (userEmail) => {
    try {
      const response = await api.post(`/admin/users/${encoded(userEmail)}/remove-strike`, {});
      if (response.data) {
        // Update user in the list
        setUsers(prev => prev.map(user => 
          user.email === userEmail ? { ...response.data } : user
        ));
        alert(`Removed 1 strike from ${userEmail}`);
      }
    } catch (error) {
      console.error('Error removing strike:', error);
    }
  };

  const banUser = async (userEmail) => {
    if (!banReason.trim()) {
      alert('Please provide a ban reason');
      return;
    }
    
    try {
      const response = await api.post(`/admin/users/${encoded(userEmail)}/ban`, { reason: banReason });
      if (response.data) {
        // Update user in the list
        setUsers(prev => prev.map(user => 
          user.email === userEmail ? { ...response.data } : user
        ));
        alert(`User ${userEmail} has been banned: ${banReason}`);
        setShowBanModal(false);
        setBanReason('');
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const unbanUser = async (userEmail) => {
    try {
      const response = await api.post(`/admin/users/${encoded(userEmail)}/unban`, {});
      if (response.data) {
        // Update user in the list
        setUsers(prev => prev.map(user => 
          user.email === userEmail ? { ...response.data } : user
        ));
        alert(`User ${userEmail} has been unbanned`);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">User Strike Management</h1>
        
        {/* User Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
              <div className="text-blue-700">Total Users</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <Ban className="h-8 w-8 text-red-600 mb-2" />
              <div className="text-2xl font-bold text-red-900">
                {users.filter(u => u.isBanned).length}
              </div>
              <div className="text-red-700">Banned Users</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-900">
                {users.filter(u => u.strikeCount > 0 && u.strikeCount < 3).length}
              </div>
              <div className="text-yellow-700">Users with Strikes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strikes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.isBanned ? (
                          <Ban className="h-4 w-4 text-red-600" />
                        ) : (
                          <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                            <span className="text-green-800 text-xs font-bold">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="ml-3">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.strikeCount === 0 ? 'bg-green-100 text-green-800' :
                        user.strikeCount === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.strikeCount === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.strikeCount}
                      </span>
                      {user.strikeCount > 0 && (
                        <Clock className="h-3 w-3 text-gray-500 ml-1" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {/* Strike Actions */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setStrikeCount(1);
                          setShowStrikeModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        title="Add strike"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeStrike(user.email)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                        title="Remove strike"
                        disabled={user.strikeCount === 0}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      
                      {/* Ban/Unban Actions */}
                      {!user.isBanned ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Ban user"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => unbanUser(user.email)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                          title="Unban user"
                        >
                          <CheckCircle className="h-4 w-4" />
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

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ban User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to ban <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email})?
            </p>
            <div className="mb-4">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => banUser(selectedUser.email)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strike Modal */}
      {showStrikeModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Strike</h3>
            <p className="text-gray-600 mb-4">
              Add strike to <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email})
            </p>
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <label className="text-sm font-medium text-gray-700">Number of strikes:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={strikeCount}
                  onChange={(e) => setStrikeCount(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStrikeModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addStrike(selectedUser.email);
                  setShowStrikeModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Add {strikeCount} Strike{strikeCount > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStrikeManagement;
