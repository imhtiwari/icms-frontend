import React, { useState, useEffect, useCallback } from 'react';
import { Search, Phone, Mail, MapPin, Clock, Building, Filter, User, Plus, Edit, Trash2, Eye, EyeOff, Zap, Droplet, Wrench, Wind, Feather, Brush, Shield, Home, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintCategories, getCategoryLabel } from '../complaints/complaintCategories';
import toast from 'react-hot-toast';
import useEscapeBack from '../../hooks/useEscapeBack';

const WorkersList = () => {
  const { api, user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryAddTarget, setCategoryAddTarget] = useState(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    specialization: '',
    designation: '',
    officeLocation: '',
    workHours: '',
    workerType: 'TECHNICAL',
    active: true
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(1000);

  useEscapeBack({
    enabled: showCreateModal || showEditModal || Boolean(selectedCategoryKey),
    onEscape: () => {
      if (showCreateModal) {
        setShowCreateModal(false);
        setCategoryAddTarget(null);
        return;
      }

      if (showEditModal) {
        setShowEditModal(false);
        setSelectedWorker(null);
        return;
      }

      if (selectedCategoryKey) {
        setSelectedCategoryKey(null);
      }
    }
  });

  useEffect(() => {
    fetchWorkers();
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ensure currentPage is a valid number
      const safeCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) ? currentPage : 0;
      const safePageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? pageSize : 10;
      
      let endpoint;
      if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
        endpoint = `/workers?page=${safeCurrentPage}&size=${safePageSize}&sort=name,asc`;
      } else {
        endpoint = `/workers/active?page=${safeCurrentPage}&size=${safePageSize}&sort=name,asc`;
      }
      
      const response = await api.get(endpoint);
      
      // Handle paginated response
      if (response.data.content) {
        setWorkers(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        // Only update currentPage if it's different from the response
        if (response.data.page !== currentPage) {
          setCurrentPage(response.data.page);
        }
      } else {
        // Fallback for non-paginated response
        setWorkers(Array.isArray(response.data) ? response.data : []);
        setTotalPages(1);
        setTotalElements(response.data.length);
        if (currentPage !== 0) {
          setCurrentPage(0);
        }
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error('Failed to fetch workers');
      setWorkers([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [api, user, currentPage, pageSize]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      if (searchTerm) {
        const activeOnly = !(user?.role === 'ADMIN' || user?.role === 'OWNER');
        const response = await api.get(`/workers/search?keyword=${encodeURIComponent(searchTerm)}&activeOnly=${activeOnly}`);
        setWorkers(Array.isArray(response.data) ? response.data : []);
      } else {
        fetchWorkers();
      }
    } catch (error) {
      console.error('Error searching workers:', error);
      toast.error('Failed to search workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      let url = '/workers/active';
      
      if (filterType) {
        url = `/workers/type/${filterType}`;
      }
      
      if (filterDepartment) {
        url = `/workers/department/${encodeURIComponent(filterDepartment)}`;
      }

      const response = await api.get(url);
      setWorkers(response.data.content || response.data);
    } catch (error) {
      console.error('Error filtering workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterDepartment('');
    fetchWorkers();
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workers', formData);
      toast.success('Worker created successfully');
      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        department: '',
        specialization: '',
        designation: '',
        officeLocation: '',
        workHours: '',
        workerType: 'TECHNICAL',
        active: true
      });
      setCategoryAddTarget(null);
      fetchWorkers();
    } catch (error) {
      console.error('Error creating worker:', error);
      toast.error(error.response?.data?.message || 'Failed to create worker');
    }
  };

  const handleUpdateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workers/${selectedWorker.id}`, formData);
      toast.success('Worker updated successfully');
      setShowEditModal(false);
      setSelectedWorker(null);
      fetchWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      toast.error(error.response?.data?.message || 'Failed to update worker');
    }
  };

  const getDefaultFormData = (categoryKey = null) => ({
    name: '',
    email: '',
    phoneNumber: '',
    department: categoryKey ? getCategoryLabel(categoryKey) : '',
    specialization: '',
    designation: '',
    officeLocation: '',
    workHours: '',
    workerType: categoryKey ? mapCategoryToWorkerType(categoryKey) : 'TECHNICAL',
    active: true
  });

  const openCreateModal = (categoryKey = null) => {
    setCategoryAddTarget(categoryKey);
    setFormData(getDefaultFormData(categoryKey));
    setShowCreateModal(true);
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await api.delete(`/workers/${id}`);
        toast.success('Worker deleted successfully');
        fetchWorkers();
      } catch (error) {
        console.error('Error deleting worker:', error);
        toast.error('Failed to delete worker');
      }
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      await api.put(`/workers/${id}/${active ? 'activate' : 'deactivate'}`);
      toast.success(`Worker ${active ? 'activated' : 'deactivated'} successfully`);
      fetchWorkers();
    } catch (error) {
      console.error('Error toggling worker status:', error);
      toast.error('Failed to update worker status');
    }
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      name: worker.name,
      email: worker.email,
      phoneNumber: worker.phoneNumber,
      department: worker.department || '',
      specialization: worker.specialization || '',
      designation: worker.designation || '',
      officeLocation: worker.officeLocation || '',
      workHours: worker.workHours || '',
      workerType: worker.workerType || 'TECHNICAL',
      active: worker.active
    });
    setShowEditModal(true);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = !searchTerm || 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || worker.workerType === filterType;
    const matchesDepartment = !filterDepartment || worker.department === filterDepartment;
    
    return matchesSearch && matchesType && matchesDepartment;
  });

  const getWorkerTypeColor = (type) => {
    const colors = {
      'TECHNICAL': 'bg-blue-100 text-blue-800',
      'ELECTRICAL': 'bg-yellow-100 text-yellow-800',
      'PLUMBING': 'bg-cyan-100 text-cyan-800',
      'CARPENTRY': 'bg-amber-100 text-amber-800',
      'MAINTENANCE': 'bg-green-100 text-green-800',
      'IT': 'bg-purple-100 text-purple-800',
      'LAB': 'bg-indigo-100 text-indigo-800',
      'HOUSEKEEPING': 'bg-pink-100 text-pink-800',
      'SECURITY': 'bg-red-100 text-red-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const categoryMapping = {
    ELECTRICAL: 'ELECTRICAL',
    PLUMBING: 'PLUMBING',
    CARPENTRY: 'CARPENTRY',
    HVAC: 'MAINTENANCE',
    PAINTING: 'MAINTENANCE',
    CLEANING: 'HOUSEKEEPING',
    SECURITY: 'SECURITY',
    OTHER: 'OTHER'
  };

  const getWorkerCategoryKey = (worker) => {
    const normalized = `${worker.workerType || ''} ${worker.department || ''} ${worker.specialization || ''}`.toLowerCase();

    if (worker.workerType && categoryMapping[worker.workerType]) {
      const mappedCategory = Object.entries(categoryMapping).find(([category, type]) => type === worker.workerType)?.[0];
      if (mappedCategory) return mappedCategory;
    }

    for (const category of complaintCategories) {
      const keyword = category.label.toLowerCase();
      if (normalized.includes(keyword) || normalized.includes(category.key.toLowerCase())) {
        return category.key;
      }
    }

    if (normalized.includes('hvac')) return 'HVAC';
    if (normalized.includes('painting')) return 'PAINTING';
    if (normalized.includes('cleaning') || normalized.includes('housekeeping')) return 'CLEANING';

    return 'OTHER';
  };

  const mapCategoryToWorkerType = (categoryKey) => {
    return categoryMapping[categoryKey] || 'TECHNICAL';
  };

  const deriveWorkersByCategory = (workerList) => {
    const grouped = complaintCategories.reduce((acc, category) => {
      acc[category.key] = [];
      return acc;
    }, { OTHER: [] });

    workerList.forEach((worker) => {
      const categoryKey = getWorkerCategoryKey(worker) || 'OTHER';
      if (!grouped[categoryKey]) grouped[categoryKey] = [];
      grouped[categoryKey].push(worker);
    });

    return complaintCategories.map((category) => ({
      category,
      workers: grouped[category.key] || []
    }));
  };

  const workersByCategory = deriveWorkersByCategory(filteredWorkers);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const selectedCategory = complaintCategories.find((category) => category.key === selectedCategoryKey);
  const selectedCategoryGroup = workersByCategory.find((group) => group.category.key === selectedCategoryKey);
  const categoryWorkers = selectedCategoryGroup?.workers || [];
  const categoryTitleMap = {
    ELECTRICAL: 'Electricians',
    PLUMBING: 'Plumbers',
    CARPENTRY: 'Carpenters',
    HVAC: 'HVAC Technicians',
    PAINTING: 'Painters',
    CLEANING: 'Cleaning Staff',
    SECURITY: 'Security Staff',
    OTHER: 'Workers',
  };
  const selectedCategoryTitle = selectedCategoryKey ? categoryTitleMap[selectedCategoryKey] || `${selectedCategory?.label || 'Worker'} Team` : 'Workers';

  const iconMap = {
    ELECTRICAL: Zap,
    PLUMBING: Droplet,
    CARPENTRY: Wrench,
    HVAC: Wind,
    PAINTING: Brush,
    CLEANING: Feather,
    SECURITY: Shield,
    OTHER: Home,
  };

  return (
    <div className="p-6">
      <div className="p-6 space-y-6">
        {!selectedCategoryKey ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900">Worker Categories</h1>
            <p className="mt-2 text-sm text-gray-500">Choose a category and then add or view workers for that department.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedCategoryKey(null)}
              className="inline-flex items-center text-slate-700 hover:text-slate-900 transition-colors mb-4 group"
            >
              <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to categories
            </button>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{selectedCategoryTitle}</h1>
              {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                <button
                  type="button"
                  onClick={() => openCreateModal(selectedCategoryKey)}
                  className="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition sm:self-auto self-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </button>
              )}
            </div>
          </div>
        )}

      {!selectedCategoryKey ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {workersByCategory.map(({ category, workers: categoryWorkers }) => {
            const Icon = iconMap[category.key] || Home;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setSelectedCategoryKey(category.key)}
                className="group block rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-100">
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="mt-6 text-xl font-semibold text-gray-900">{category.label}</h2>
                <p className="mt-2 text-sm text-gray-500">{categoryWorkers.length} worker{categoryWorkers.length === 1 ? '' : 's'}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {categoryWorkers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
              No workers assigned to this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryWorkers.map((worker) => (
                <div key={worker.id} className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                      <p className="text-sm text-gray-600">{worker.designation || 'Staff Member'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getWorkerTypeColor(worker.workerType)}`}>
                      {worker.workerType?.replace('_', ' ') || 'OTHER'}
                    </span>
                  </div>
                  <div className="space-y-3 text-sm text-gray-700">
                    {worker.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{worker.phoneNumber}</span>
                      </div>
                    )}
                    {worker.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{worker.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{worker.department || getCategoryLabel(selectedCategory?.key)}</span>
                    </div>
                  </div>
                  {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${worker.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {worker.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(worker)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit Worker"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(worker.id, !worker.active)}
                          className={`${worker.active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={worker.active ? 'Deactivate' : 'Activate'}
                        >
                          {worker.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Worker"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {showCreateModal ? 'Create New Worker' : 'Edit Worker'}
            </h2>
            {showCreateModal && categoryAddTarget && (
              <p className="text-sm text-gray-500 mb-4">
                Adding to <span className="font-semibold text-gray-900">{getCategoryLabel(categoryAddTarget)}</span> category.
              </p>
            )}
            <form onSubmit={showCreateModal ? handleCreateWorker : handleUpdateWorker}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10 digit phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Worker Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.workerType}
                    onChange={(e) => setFormData({...formData, workerType: e.target.value})}
                    disabled={showCreateModal && categoryAddTarget !== null}
                  >
                    <option value="TECHNICAL">Technical Staff</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="CARPENTRY">Carpentry</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="IT">IT Support</option>
                    <option value="LAB">Lab Technician</option>
                    <option value="HOUSEKEEPING">Housekeeping</option>
                    <option value="SECURITY">Security</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Hours</label>
                  <input
                    type="text"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.workHours}
                    onChange={(e) => setFormData({...formData, workHours: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <textarea
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (showCreateModal) {
                      setShowCreateModal(false);
                      setCategoryAddTarget(null);
                    } else {
                      setShowEditModal(false);
                    }
                    setSelectedWorker(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {showCreateModal ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkersList;
