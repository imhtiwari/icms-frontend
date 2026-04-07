import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Edit, 
  Key, 
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import useEscapeBack from '../hooks/useEscapeBack';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEscapeBack({
    enabled: editMode,
    onEscape: () => setEditMode(false)
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      // API call placeholder
      toast.success('Profile updated successfully!');
      setEditMode(false);
      
      if (formData.newPassword) {
        logout();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'OWNER':
        return <Shield className="h-5 w-5 text-primary-600" />;
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-secondary-600" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'OWNER':
        return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'ADMIN':
        return 'bg-secondary-50 text-secondary-700 border-secondary-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 pt-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 shadow-lg relative overflow-hidden border border-gray-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center border border-gray-200 shadow-inner">
              <span className="text-4xl font-bold text-gray-900">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="pt-4">
              <h1 className="text-3xl font-bold mb-1 text-gray-900">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeClass(user.role)} bg-white`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1.5">{user.role}</span>
                </span>
                <span className="flex items-center text-gray-500 text-sm">
                  <Mail className="h-4 w-4 mr-1.5" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            {editMode ? (
              <>Cancel Editing</>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>
        {/* Background Decorative Pattern */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              <UserCheck className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account Status</p>
              <p className="text-lg font-bold text-gray-900">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <Shield className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Account Type</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Member Since</p>
              <p className="text-lg font-bold text-gray-900">March 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
            </div>
            <div className="p-8 pt-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        disabled={!editMode}
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none ${!editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">* Email is permanently linked to your account</p>
                  </div>
                </div>

                {editMode && (
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary px-8">
                      Update Profile
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Security Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary-600" />
                Security
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {!editMode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                    <p className="text-sm font-medium text-primary-900 mb-1">Password Protected</p>
                    <p className="text-xs text-primary-700 leading-relaxed">
                      Your password was last changed on your account registration. Enable edit mode to update it.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 transition-all flex items-center justify-center group"
                  >
                    <Key className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="••••••••"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Min. 8 chars"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <button type="submit" className="w-full btn btn-primary mt-2">
                    Update Security
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Stats/Tip Card */}
          <div className="bg-gradient-to-br from-secondary-600 to-secondary-800 rounded-2xl p-6 text-white shadow-md">
            <h4 className="font-bold flex items-center mb-3">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Tip
            </h4>
            <p className="text-sm text-secondary-100 leading-relaxed">
              Ensure your password is unique and complex. We recommend at least 12 characters with symbols for maximum safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
