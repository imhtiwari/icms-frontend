import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, User, Mail, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import useEscapeBack from '../../hooks/useEscapeBack';

const CreateUser = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);

  useEscapeBack({
    enabled: true,
    onEscape: () => navigate('/admin/users'),
    shouldHandle: () => !loading
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      let endpoint;
      switch (formData.role) {
        case 'ADMIN':
          endpoint = '/admin/create-admin';
          break;
        case 'WORKER':
          endpoint = '/admin/create-worker';
          break;
        default:
          endpoint = '/auth/register';
      }

      await api.post(endpoint, formData);
      toast.success('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-primary-600" />;
      case 'WORKER':
        return <User className="h-5 w-5 text-success-600" />;
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-secondary flex items-center space-x-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600">Add a new user to the system</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input pl-10"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input pl-10"
                placeholder="user@medicaps.ac.in"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              For regular users, email must end with @medicaps.ac.in
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength="8"
                className="input pl-10"
                placeholder="Enter password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters long
            </p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              User Role *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getRoleIcon(formData.role)}
              </div>
              <select
                id="role"
                name="role"
                required
                className="input pl-10 appearance-none"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="USER">Regular User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select the appropriate role for this user
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {formData.role === 'USER' && (
                <>
                  <p>• Can create and view their own complaints</p>
                  <p>• Can upload evidence for their complaints</p>
                  <p>• Can track complaint status</p>
                </>
              )}
              {formData.role === 'ADMIN' && (
                <>
                  <p>• Can manage all complaints</p>
                  <p>• Can view system statistics</p>
                  <p>• Can manage user accounts</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
