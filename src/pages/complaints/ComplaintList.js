import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Calendar,
  MapPin,
  Search,
  Filter,
  Tag,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ChevronDown,
  X,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import AlertModal from '../../components/AlertModal';
import Toast from '../../components/Toast';
import '../../styles/animations.css';
import useEscapeBack from '../../hooks/useEscapeBack';

const ComplaintList = ({ defaultCategory = '' }) => {
  const { api, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningWorker, setAssigningWorker] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  
  // Custom alert and toast state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory);
  const [showFilters, setShowFilters] = useState(false);
  const isCategoryPage = Boolean(defaultCategory);
  const navigate = useNavigate();

  useEffect(() => {
    setCategoryFilter(defaultCategory);
  }, [defaultCategory]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (typeof currentPage !== 'number' || isNaN(currentPage)) {
      setCurrentPage(0);
      return;
    }
    if (typeof pageSize !== 'number' || isNaN(pageSize)) {
      setPageSize(10);
      return;
    }
    
    fetchComplaints();
    fetchWorkers();
  }, [currentPage, pageSize, statusFilter, priorityFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDeleteOptions && !event.target.closest('.delete-dropdown')) {
        setShowDeleteOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeleteOptions]);

  useEscapeBack({
    enabled: isCategoryPage,
    onEscape: () => navigate('/complaints')
  });

  // Helper functions for custom alerts and toasts
  const showAlert = (title, message, type = 'warning', onConfirm = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const showToast = (message, type = 'info') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers/active');
      setWorkers(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const groupWorkersByCategory = (workerList) => {
    return workerList.reduce((groups, worker) => {
      const groupKey = worker.workerType || worker.department || 'Other';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(worker);
      return groups;
    }, {});
  };

  const formatGroupLabel = (groupKey) => {
    if (!groupKey) return 'Other';
    return groupKey === 'Other' ? 'Other' : groupKey.replace(/_/g, ' ');
  };

  const workerCategoryFilters = {
    ELECTRICAL: {
      types: ['ELECTRICAL'],
      departments: ['ELECTRICAL'],
      keywords: ['ELECTRICAL']
    },
    PLUMBING: {
      types: ['PLUMBING'],
      departments: ['PLUMBING'],
      keywords: ['PLUMBING']
    },
    CARPENTRY: {
      types: ['CARPENTRY'],
      departments: ['CARPENTRY', 'FURNITURE'],
      keywords: ['CARPENTRY', 'FURNITURE']
    },
    HVAC: {
      types: ['AIR_CONDITIONING', 'HVAC'],
      departments: ['AIR_CONDITIONING', 'HVAC'],
      keywords: ['AIR CONDITIONING', 'AC', 'COOLING', 'HVAC']
    },
    PAINTING: {
      types: ['PAINTING'],
      departments: ['PAINTING', 'MAINTENANCE', 'BUILDING_MAINTENANCE'],
      keywords: ['PAINTING', 'MAINTENANCE', 'BUILDING']
    },
    CLEANING: {
      types: ['CLEANING', 'HOUSEKEEPING'],
      departments: ['CLEANING', 'HOUSEKEEPING'],
      keywords: ['CLEANING', 'HOUSEKEEPING']
    },
    SECURITY: {
      types: ['SECURITY'],
      departments: ['SECURITY'],
      keywords: ['SECURITY']
    },
    IT_INFRASTRUCTURE: {
      types: ['IT'],
      departments: ['IT', 'COMPUTER'],
      keywords: ['IT', 'COMPUTER', 'TECH SUPPORT']
    },
    AIR_CONDITIONING: {
      types: ['AIR_CONDITIONING'],
      departments: ['AIR_CONDITIONING', 'HVAC'],
      keywords: ['AIR CONDITIONING', 'AC', 'COOLING', 'HVAC']
    },
    LIFT: {
      types: ['LIFT'],
      departments: ['LIFT', 'ELEVATOR'],
      keywords: ['LIFT', 'ELEVATOR']
    },
    BUILDING_MAINTENANCE: {
      types: ['MAINTENANCE', 'BUILDING_MAINTENANCE'],
      departments: ['MAINTENANCE', 'BUILDING_MAINTENANCE', 'BUILDING', 'CIVIL'],
      keywords: ['BUILDING', 'CIVIL', 'MAINTENANCE']
    },
    OTHER: null
  };

  const normalizeText = (text) => {
    return (text || '').toString().trim().toLowerCase();
  };

  const isWorkerRelevantToCategory = (worker, assetCategory) => {
    if (!assetCategory || assetCategory === 'OTHER') return true;

    const filter = workerCategoryFilters[assetCategory];
    if (!filter) return true;

    const type = normalizeText(worker.workerType);
    const department = normalizeText(worker.department);
    const specialization = normalizeText(worker.specialization);

    const matchesType = filter.types.some((value) => type === normalizeText(value));
    const matchesDepartment = filter.departments.some((value) => department === normalizeText(value));
    const matchesKeyword = filter.keywords.some((value) => {
      const normalizedKeyword = normalizeText(value);
      return (
        type.includes(normalizedKeyword) ||
        department.includes(normalizedKeyword) ||
        specialization.includes(normalizedKeyword)
      );
    });

    return matchesType || matchesDepartment || matchesKeyword;
  };

  const getRelevantWorkers = (category) => {
    if (!category) return workers;

    const filtered = workers.filter((worker) => isWorkerRelevantToCategory(worker, category));
    return filtered.length > 0 ? filtered : workers;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const assignWorker = async (complaintId, workerId) => {
    try {
      setAssigningWorker(complaintId);
      await api.patch(`/complaints/${complaintId}/assign`, { workerId: parseInt(workerId) });
      
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === complaintId 
            ? { ...complaint, workerName: workers.find(w => w.id === parseInt(workerId))?.name, status: 'IN_PROGRESS' }
            : complaint
        )
      );
      
      toast.success('Worker assigned successfully!');
    } catch (error) {
      console.error('Error assigning worker:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to assign worker';
      toast.error(errorMessage);
    } finally {
      setAssigningWorker(null);
    }
  };

  const deleteAllComplaints = async () => {
    showAlert(
      'Delete All Complaints',
      'Are you sure you want to delete ALL complaints? This action cannot be undone and will permanently remove all complaints from the system.',
      'error',
      () => {
        // Second confirmation
        showAlert(
          'Final Confirmation',
          'This is a destructive action! All complaints, their attachments, and related data will be permanently deleted. Are you absolutely sure?',
          'error',
          () => performDelete('all')
        );
      }
    );
  };

  const deleteComplaintsByMonth = async (monthsBack) => {
    const monthNames = ['this month', 'last month', '2 months ago', '3 months ago', '6 months ago'];
    const monthName = monthNames[monthsBack] || `${monthsBack} months ago`;
    
    showAlert(
      `Delete ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} Complaints`,
      `Are you sure you want to delete all complaints from ${monthName}? This action cannot be undone.`,
      'warning',
      () => performDelete('month', monthsBack)
    );
  };

  const deleteComplaintsByStatus = async (status) => {
    showAlert(
      `Delete ${status} Complaints`,
      `Are you sure you want to delete all ${status.toLowerCase()} complaints? This action cannot be undone.`,
      'warning',
      () => performDelete('status', status)
    );
  };

  const performDelete = async (type, value) => {
    try {
      setDeletingAll(true);
      setShowDeleteOptions(false);
      
      // Get all complaints first (without pagination)
      const allComplaintsResponse = await api.get('/complaints?size=1000');
      const allComplaints = allComplaintsResponse.data.content || allComplaintsResponse.data || [];
      
      if (allComplaints.length === 0) {
        showToast('No complaints to delete.', 'info');
        return;
      }

      // Filter complaints based on delete type
      let complaintsToDelete = allComplaints;
      const now = new Date();
      
      if (type === 'month') {
        const monthsBack = parseInt(value);
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
        
        complaintsToDelete = allComplaints.filter(complaint => {
          const complaintDate = new Date(complaint.createdAt);
          return complaintDate >= cutoffDate && complaintDate <= endDate;
        });
      } else if (type === 'status') {
        complaintsToDelete = allComplaints.filter(complaint => complaint.status === value);
      }

      if (complaintsToDelete.length === 0) {
        showToast('No complaints found matching the criteria.', 'info');
        return;
      }

      // Delete each complaint individually
      let deletedCount = 0;
      for (const complaint of complaintsToDelete) {
        try {
          await api.delete(`/complaints/${complaint.id}`);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete complaint ${complaint.id}:`, error);
        }
      }

      // Refresh the complaints list
      await fetchComplaints();
      
      const typeText = type === 'all' ? 'all' : `${type} (${deletedCount} found)`;
      showToast(`Successfully deleted ${deletedCount} out of ${complaintsToDelete.length} ${typeText} complaints.`, 'success');
      
      // Reset to first page
      setCurrentPage(0);
      
    } catch (error) {
      console.error('Error deleting complaints:', error);
      showToast('Failed to delete complaints. Please try again.', 'error');
    } finally {
      setDeletingAll(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const safeCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) ? currentPage : 0;
      const safePageSize = typeof pageSize === 'number' && !isNaN(pageSize) ? pageSize : 10;
      
      let url = `/complaints?page=${safeCurrentPage}&size=${safePageSize}&sort=createdAt,desc`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      
      const response = await api.get(url);
      
      if (response.data.content) {
        setComplaints(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setCurrentPage(response.data.page);
      } else {
        const allComplaints = response.data || [];
        setComplaints(Array.isArray(allComplaints) ? allComplaints : []);
        setTotalPages(1);
        setTotalElements(allComplaints.length);
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setBlockFilter('');
    setCategoryFilter(isCategoryPage ? defaultCategory : '');
    setCurrentPage(0);
  };

  const hasActiveFilters = searchTerm || statusFilter || priorityFilter || blockFilter || (!isCategoryPage && categoryFilter);

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
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const complaintCategories = [
    { key: 'ELECTRICAL', label: 'Electrical', slug: 'electrical' },
    { key: 'PLUMBING', label: 'Plumbing', slug: 'plumbing' },
    { key: 'CARPENTRY', label: 'Carpentry', slug: 'carpentry' },
    { key: 'HVAC', label: 'HVAC', slug: 'hvac' },
    { key: 'PAINTING', label: 'Painting', slug: 'painting' },
    { key: 'CLEANING', label: 'Cleaning', slug: 'cleaning' },
    { key: 'SECURITY', label: 'Security', slug: 'security' },
    { key: 'OTHER', label: 'Other', slug: 'other' }
  ];
  const selectedCategorySlug = complaintCategories.find((category) => category.key === defaultCategory)?.slug;

  const getCategoryLabel = (categoryKey) => {
    return complaintCategories.find(category => category.key === categoryKey)?.label || (categoryKey?.replace('_', ' ') || 'Other');
  };

  const getBlockOptions = () => {
    return Array.from(
      new Set(
        complaints
          .map((complaint) => complaint.blockNumber)
          .filter((block) => block)
      )
    ).sort();
  };

  const groupComplaintsByCategory = (complaintList) => {
    return complaintList.reduce((groups, complaint) => {
      const categoryKey = complaint.assetCategory || 'OTHER';
      if (!groups[categoryKey]) {
        groups[categoryKey] = [];
      }
      groups[categoryKey].push(complaint);
      return groups;
    }, {});
  };

  const getOrderedCategoryKeys = (groups) => {
    const ordered = complaintCategories
      .map(category => category.key)
      .filter(key => groups[key]?.length);
    const extraKeys = Object.keys(groups).filter(key => !ordered.includes(key));
    return [...ordered, ...extraKeys];
  };

  // Client-side filtering for search term and category (backend handles status/priority)
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = !searchTerm || 
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id?.toString().includes(searchTerm);
    const matchesCategory = !categoryFilter || complaint.assetCategory === categoryFilter;
    const matchesBlock = !blockFilter || complaint.blockNumber === blockFilter;
    return matchesSearch && matchesCategory && matchesBlock;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative">
        <div className="relative z-10">
          {isCategoryPage && (
            <button
              type="button"
              onClick={() => navigate('/complaints')}
              className="inline-flex items-center text-slate-700 hover:text-slate-900 transition-colors mb-4 group"
            >
              <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to categories
            </button>
          )}
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {isCategoryPage ? `${getCategoryLabel(defaultCategory)} Complaints` : 'Complaints'}
          </h1>
          <p className="text-gray-500 italic">
            {isCategoryPage
              ? `This is where all the ${getCategoryLabel(defaultCategory).toLowerCase()} complaints live. Use the filters below to refine by status, priority, or block.`
              : 'Manage and track your infrastructure complaints efficiently'}
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          {!isAdmin && (
            <Link
              to="/complaints/new"
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all duration-300 shadow-md flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Complaint</span>
            </Link>
          )}
          {isAdmin && (
            <div className="relative delete-dropdown z-50">
              <button
                onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                disabled={deletingAll || loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md flex items-center justify-center space-x-2 border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
              >
                {deletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    <span>Delete</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDeleteOptions ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              {/* Dropdown Menu */}
              {showDeleteOptions && !deletingAll && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                  <div className="p-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delete by Time</div>
                    <button
                      onClick={() => deleteComplaintsByMonth(0)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>This Month</span>
                    </button>
                    <button
                      onClick={() => deleteComplaintsByMonth(1)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Last Month</span>
                    </button>
                    <button
                      onClick={() => deleteComplaintsByMonth(3)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>3 Months Ago</span>
                    </button>
                    <button
                      onClick={() => deleteComplaintsByMonth(6)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>6 Months Ago</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delete by Status</div>
                    <button
                      onClick={() => deleteComplaintsByStatus('RESOLVED')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolved</span>
                    </button>
                    <button
                      onClick={() => deleteComplaintsByStatus('PENDING')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Pending</span>
                    </button>
                    <button
                      onClick={() => deleteComplaintsByStatus('IN_PROGRESS')}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center space-x-3"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>In Progress</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-4 py-2 text-xs font-semibold text-red-600 uppercase tracking-wider">Danger Zone</div>
                    <button
                      onClick={deleteAllComplaints}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-3 font-bold"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete All Complaints</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, description, ID, assignee..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(0); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white min-w-[140px]"
          >
            <option value="">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Block Filter */}
          <select
            value={blockFilter}
            onChange={(e) => { setBlockFilter(e.target.value); setCurrentPage(0); }}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white min-w-[140px]"
          >
            <option value="">All Blocks</option>
            {getBlockOptions().map((block) => (
              <option key={block} value={block}>
                Block {block}
              </option>
            ))}
          </select>

          {!isCategoryPage && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white min-w-[140px]"
            >
              <option value="">All Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="CARPENTRY">Carpentry</option>
              <option value="HVAC">HVAC</option>
              <option value="PAINTING">Painting</option>
              <option value="CLEANING">Cleaning</option>
              <option value="SECURITY">Security</option>
              <option value="OTHER">Other</option>
            </select>
          )}

          {/* Toggle advanced filters / Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Active filters:</span>
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Status: {statusFilter.replace('_', ' ')}
                <button onClick={() => setStatusFilter('')} className="hover:text-blue-900"><X className="h-3 w-3" /></button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full border border-orange-200">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('')} className="hover:text-orange-900"><X className="h-3 w-3" /></button>
              </span>
            )}
            {!isCategoryPage && categoryFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                Category: {categoryFilter.replace('_', ' ')}
                <button onClick={() => setCategoryFilter('')} className="hover:text-purple-900"><X className="h-3 w-3" /></button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-gray-900"><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {!isCategoryPage && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Complaints by Category
              <span className="ml-2 text-sm font-normal text-gray-500">({filteredComplaints.length}{hasActiveFilters ? ' filtered' : ''})</span>
            </h2>
          </div>
        )}
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500 mb-6">
              {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'No complaints found in this category yet.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <X className="mr-2 h-5 w-5" />
                Clear All Filters
              </button>
            ) : (
              !isAdmin && (
                <Link
                  to="/complaints/new"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Create Complaint
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const grouped = groupComplaintsByCategory(filteredComplaints);
              const categoryKeys = getOrderedCategoryKeys(grouped);

              return categoryKeys.map((categoryKey) => {
                const categoryComplaints = grouped[categoryKey] || [];
                if (categoryComplaints.length === 0) {
                  return null;
                }

                return (
                  <div key={categoryKey} className={isCategoryPage ? 'space-y-4' : 'rounded-2xl border border-gray-200 bg-gray-50 p-5'}>
                    {!isCategoryPage && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{getCategoryLabel(categoryKey)}</h3>
                          <p className="text-sm text-gray-500">Showing {categoryComplaints.length} complaint{categoryComplaints.length > 1 ? 's' : ''} in this category.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-3 py-2 rounded-full bg-white text-sm font-medium text-gray-700 border border-gray-200">
                            {getCategoryLabel(categoryKey)} section
                          </span>
                          <button
                            onClick={() => { setCategoryFilter(categoryKey); setCurrentPage(0); }}
                            className="px-3 py-2 rounded-full bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Filter inside {getCategoryLabel(categoryKey)}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {categoryComplaints.map((complaint) => (
                        <div
                          key={complaint.id}
                          className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <h3 className="text-lg font-medium text-gray-900">{complaint.title}</h3>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {complaint.assetCategory?.replace('_', ' ') || 'OTHER'}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                    {complaint.status.replace('_', ' ')}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getPriorityColor(complaint.priority)}`}>
                                    {complaint.priority}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-4 line-clamp-2">{complaint.description}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(complaint.createdAt).toLocaleDateString()}
                                </div>
                                {complaint.blockNumber && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Block {complaint.blockNumber}
                                    {complaint.roomNumber && `, Room ${complaint.roomNumber}`}
                                  </div>
                                )}
                                {complaint.workerName && (
                                  <div className="flex items-center text-primary-700 font-medium">
                                    <User className="h-4 w-4 mr-1" />
                                    Assigned to: {complaint.workerName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 min-w-[180px]">
                              {isAdmin && !complaint.workerName && complaint.status !== 'RESOLVED' && (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      assignWorker(complaint.id, e.target.value);
                                    }
                                  }}
                                  value=""
                                  disabled={assigningWorker === complaint.id}
                                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                  <option value="">Assign Worker</option>
                                  {Object.entries(groupWorkersByCategory(getRelevantWorkers(complaint.assetCategory))).map(([group, groupWorkers]) => (
                                    <optgroup label={formatGroupLabel(group)} key={group}>
                                      {groupWorkers.map(worker => (
                                        <option key={worker.id} value={worker.id}>
                                          {worker.name} - {worker.department || worker.workerType}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                              )}
                              <Link
                                to={`/complaints/${complaint.id}`}
                                state={{ from: isCategoryPage && selectedCategorySlug ? `/complaints/category/${selectedCategorySlug}` : '/complaints' }}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200 justify-center"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} complaints
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      {/* Custom Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
          duration={5000}
        />
      )}
    </>
  );
};

export default ComplaintList;
