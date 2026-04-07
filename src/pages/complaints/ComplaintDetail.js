import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  User,
  ArrowLeft,
  Download,
  Trash2,
  Camera,
  Edit,
  Settings,
  UserPlus,
  Zap,
  Tag,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { complaintCategories } from './complaintCategories';
import useEscapeBack from '../../hooks/useEscapeBack';

/* ─────────── Helper Functions ─────────── */
const getAuthenticatedImageUrl = async (evidence, api, baseURL, imageUrls, setImageUrls) => {
  // If we already have a blob URL, return it
  if (imageUrls[evidence.id]) {
    return imageUrls[evidence.id];
  }

  try {
    // Try the download URL first with proper authentication
    const response = await api.get(evidence.downloadUrl, {
      responseType: 'blob'
    });
    
    // Create a blob URL
    const blobUrl = URL.createObjectURL(response.data);
    
    // Cache the blob URL
    setImageUrls(prev => ({
      ...prev,
      [evidence.id]: blobUrl
    }));
    
    return blobUrl;
  } catch (error) {
    // Try alternative approach - direct URL with auth header
    try {
      const token = localStorage.getItem('token');
      const directUrl = `${baseURL}${evidence.viewUrl}`;
      
      const response = await fetch(directUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        setImageUrls(prev => ({
          ...prev,
          [evidence.id]: blobUrl
        }));
        
        return blobUrl;
      }
    } catch (directError) {
      // Final fallback - return URL with token as query param
      const token = localStorage.getItem('token');
      return `${baseURL}${evidence.viewUrl}?token=${token}`;
    }
  }
};

/* ─────────── Async Image Component ─────────── */
const AsyncImage = ({ evidence, className, style, onError, api, baseURL, imageUrls, setImageUrls }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        setLoading(true);
        
        // If we already have a blob URL, return it
        if (imageUrls[evidence.id]) {
          setImageUrl(imageUrls[evidence.id]);
          setLoading(false);
          return;
        }
        
        const url = await getAuthenticatedImageUrl(evidence, api, baseURL, imageUrls, setImageUrls);
        if (mounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        if (mounted) {
          setLoading(false);
          if (onError) onError(error);
        }
      }
    };

    loadImage();
    
    return () => {
      mounted = false;
    };
  }, [evidence.id, imageUrls]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={style}>
        <ImageIcon className="h-10 w-10 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={evidence.fileName}
      className={className}
      style={style}
      onError={onError}
    />
  );
};

/* ─────────── Image Lightbox Component ─────────── */
const ImageLightbox = ({ images, currentIndex, onClose, onPrev, onNext, baseURL, api, imageUrls, setImageUrls }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        style={{ border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-white text-sm font-medium backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Main image */}
      <div 
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <AsyncImage
          evidence={image}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
          style={{ 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'fadeScaleIn 0.3s ease-out'
          }}
          onError={(e) => {
            console.error('Lightbox image failed to load:', image.fileName);
          }}
          api={api}
          baseURL={baseURL}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
        />
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image filename */}
      <div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl text-white text-sm backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        {image.fileName}
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ─────────── Main ComplaintDetail Component ─────────── */
const ComplaintDetail = () => {
  const { id } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [complaint, setComplaint] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [assigningWorker, setAssigningWorker] = useState(false);
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [falseModalOpen, setFalseModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState({}); // Cache for blob URLs
  const [falseComplaintReasonInput, setFalseComplaintReasonInput] = useState('');
  const [strikeActionLoading, setStrikeActionLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';

  // Base URL for image requests (same origin as API)
  const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:8083';
  console.log('Base URL for images:', baseURL);

  useEffect(() => {
    fetchComplaint();
    fetchEvidences();
    if (isAdmin) {
      fetchWorkers();
    }
  }, [id, isAdmin]);

  useEffect(() => {
    document.body.style.overflow = workerModalOpen || falseModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [workerModalOpen, falseModalOpen]);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/workers/active');
      setWorkers(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
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

  const getRelevantWorkers = () => {
    if (!complaint) return workers;

    const filtered = workers.filter((worker) => isWorkerRelevantToCategory(worker, complaint.assetCategory));
    return filtered.length > 0 ? filtered : workers;
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

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      fetchComplaint(); // Refresh
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/complaints/${id}`);
      setComplaint(response.data);
      setFalseComplaintReasonInput(response.data?.falseComplaintReason || '');
      
      // Check if complaint has attachments/evidences in main response
      if (response.data.attachments || response.data.evidences || response.data.files) {
        setEvidences(response.data.attachments || response.data.evidences || response.data.files);
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidences = async () => {
    try {
      const response = await api.get(`/files/complaint/${id}`);
      const evidencesData = response.data || [];
      setEvidences(evidencesData);
      
      // Check if complaint has attachments/evidences in main response
      if (response.data.attachments || response.data.evidences || response.data.files) {
        setEvidences(response.data.attachments || response.data.evidences || response.data.files);
      }
    } catch (error) {
      // Handle 403 Forbidden specifically
      if (error.response?.status === 403) {
        // Try to get file info from the complaint itself
        if (complaint && (complaint.attachments || complaint.evidences || complaint.files)) {
          const filesFromComplaint = complaint.attachments || complaint.evidences || complaint.files;
          setEvidences(filesFromComplaint);
        }
      }
      
      // Try alternative endpoints that might work for admins
      tryAlternativeEndpoints();
      
      // Don't show toast for 403 as it's expected for admins
      if (error.response?.status !== 403) {
        try {
          toast.error('Failed to load evidence files');
        } catch (toastError) {
          console.warn('Toast error:', toastError);
        }
      }
    }
  };

  const tryAlternativeEndpoints = async () => {
    // Try different endpoints that might work (without /api prefix since axios adds it)
    const alternativeEndpoints = [
      `/admin/files/complaint/${id}`,
      `/complaints/${id}/files`,
      `/complaints/${id}/attachments`,
      `/files/list?complaintId=${id}`
    ];
    
    for (const endpoint of alternativeEndpoints) {
      try {
        const response = await api.get(endpoint);
        
        if (response.data && (Array.isArray(response.data) || response.data.content)) {
          const files = response.data.content || response.data;
          if (files.length > 0) {
            setEvidences(files);
            return;
          }
        }
      } catch (endpointError) {
        // Continue to next endpoint
      }
    }
  };

  const markFalseComplaint = async (reasonArg) => {
    const reason = (reasonArg || falseComplaintReasonInput || '').trim();
    if (!reason) {
      toast.error('Please enter a reason for marking this as a false complaint');
      return;
    }
    try {
      setStrikeActionLoading(true);
      const response = await api.post(`/complaints/${id}/mark-false`, { reason });
      const banUntil = response.data?.complaintBannedUntil;
      if (banUntil) {
        toast.success(`Marked false. User reached 3 strikes and is blocked from new complaints until ${new Date(banUntil).toLocaleString()}.`);
      } else {
        const strikeCount = response.data?.strikeCount;
        toast.success(
          strikeCount
            ? `Marked false. Strike ${strikeCount} applied to the reporting user.`
            : 'Marked as false complaint — strike applied to the reporting user'
        );
      }
      setFalseComplaintReasonInput('');
      setFalseModalOpen(false);
      fetchComplaint();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to mark false complaint');
    } finally {
      setStrikeActionLoading(false);
    }
  };

  const clearFalseComplaint = async () => {
    if (!window.confirm('Clear false-complaint flag and remove one strike from the reporting user?')) {
      return;
    }
    try {
      setStrikeActionLoading(true);
      await api.post(`/complaints/${id}/mark-valid`);
      toast.success('False flag cleared');
      fetchComplaint();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to clear false complaint');
    } finally {
      setStrikeActionLoading(false);
    }
  };

  const assignWorker = async (workerId) => {
    try {
      setAssigningWorker(true);
      await api.patch(`/complaints/${id}/assign`, { workerId: parseInt(workerId) });
      toast.success('Worker assigned successfully');
      fetchComplaint(); // Refresh
    } catch (error) {
      console.error('Error assigning worker:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to assign worker';
      toast.error(errorMessage);
    } finally {
      setAssigningWorker(false);
    }
  };

  const assignSelectedWorker = async () => {
    if (!selectedWorkerId) {
      toast.error('Please select a worker to assign');
      return;
    }

    await assignWorker(selectedWorkerId);
    setWorkerModalOpen(false);
    setSelectedWorkerId(null);
  };

  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + evidences.length) % evidences.length);
  }, [evidences.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % evidences.length);
  }, [evidences.length]);

  const getBackPath = () => {
    if (location.state?.from) return location.state.from;

    const categorySlug = complaint?.assetCategory
      ? complaintCategories.find((category) => category.key === complaint.assetCategory)?.slug
      : null;

    return categorySlug ? `/complaints/category/${categorySlug}` : '/complaints';
  };
  const backPath = getBackPath();

  useEscapeBack({
    enabled: true,
    onEscape: () => navigate(backPath),
    shouldHandle: () => !lightboxOpen && !workerModalOpen && !falseModalOpen
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'RESOLVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'URGENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = () => {
    if (!complaint) return 'PENDING';
    if (complaint.status === 'REJECTED') return 'REJECTED';
    if (complaint.status === 'RESOLVED') return 'RESOLVED';
    if (complaint.workerId) return 'IN_PROGRESS';
    return 'PENDING';
  };

  const downloadFile = async (evidence) => {
    try {
      const response = await api.get(evidence.downloadUrl, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = evidence.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const deleteEvidence = async (evidenceId) => {
    if (!window.confirm('Are you sure you want to delete this evidence?')) {
      return;
    }

    try {
      await api.delete(`/files/${evidenceId}`);
      setEvidences(evidences.filter(e => e.id !== evidenceId));
      toast.success('Evidence deleted successfully');
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Failed to delete evidence');
    }
  };

  const deleteComplaint = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted successfully');
      navigate('/complaints');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Complaint not found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Lightbox */}
      {lightboxOpen && evidences.length > 0 && (
        <ImageLightbox
          images={evidences}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          baseURL={baseURL}
          api={api}
          imageUrls={imageUrls}
          setImageUrls={setImageUrls}
        />
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-6 overflow-hidden relative mb-6">
        <div className="relative z-10 flex-1">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center text-slate-700 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Complaints
          </button>
          <h1 className="text-3xl font-bold mb-3 text-gray-900 flex flex-wrap items-center gap-3">
            <span>{complaint.title}</span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
              {getDisplayStatus().replace('_', ' ')}
            </span>
          </h1>
          <p className="text-sm text-gray-600 max-w-3xl leading-7 whitespace-pre-wrap line-clamp-3 overflow-hidden">
            {complaint.description}
            <span className={`text-sm font-medium ${complaint.workerName ? 'text-gray-900' : 'text-amber-600'}`}>
              {complaint.workerName ? ` · Assigned to ${complaint.workerName}` : ' · Worker not assigned yet'}
            </span>
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-end gap-3">
          <Link
            to={`/complaints/${id}/edit`}
            state={{ from: `/complaints/${id}` }}
            className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setWorkerModalOpen(true)}
              className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Worker
            </button>
          )}
          <button
            type="button"
            onClick={() => setFalseModalOpen(true)}
            className="inline-flex items-center px-4 py-3 border border-amber-500 rounded-xl shadow-sm text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Mark False
          </button>
          <button
            type="button"
            onClick={deleteComplaint}
            className="inline-flex items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {workerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setWorkerModalOpen(false);
              setSelectedWorkerId(null);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select available worker</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Showing active workers for {complaint.assetCategory?.replace('_', ' ') || 'this category'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWorkerModalOpen(false);
                  setSelectedWorkerId(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {getRelevantWorkers().length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
                No active workers are available for this category right now.
              </div>
            ) : (
              <div className="grid gap-3">
                {getRelevantWorkers().map((worker) => (
                  <button
                    key={worker.id}
                    type="button"
                    onClick={() => setSelectedWorkerId(worker.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${selectedWorkerId === worker.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{worker.name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {worker.specialization || worker.department || worker.workerType || 'Worker'}
                        </p>
                        {worker.phone && <p className="mt-1 text-xs text-gray-500">{worker.phone}</p>}
                      </div>
                      {selectedWorkerId === worker.id && (
                        <span className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setWorkerModalOpen(false);
                  setSelectedWorkerId(null);
                }}
                className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={assignSelectedWorker}
                disabled={!selectedWorkerId || assigningWorker}
                className="inline-flex w-full justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300 sm:w-auto"
              >
                {assigningWorker ? 'Assigning…' : 'Assign selected worker'}
              </button>
            </div>
          </div>
        </div>
      )}

      {falseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setFalseModalOpen(false);
              setFalseComplaintReasonInput('');
            }}
          />
          <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Mark complaint as false</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Provide a reason that will be recorded when the complaint is rejected.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFalseModalOpen(false);
                  setFalseComplaintReasonInput('');
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={falseComplaintReasonInput}
              onChange={(e) => setFalseComplaintReasonInput(e.target.value)}
              rows={5}
              placeholder="Enter a reason for marking this complaint as false"
              className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFalseModalOpen(false);
                  setFalseComplaintReasonInput('');
                }}
                className="inline-flex w-full justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => markFalseComplaint(falseComplaintReasonInput)}
                disabled={!falseComplaintReasonInput.trim() || strikeActionLoading}
                className="inline-flex w-full justify-center rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300 sm:w-auto"
              >
                {strikeActionLoading ? 'Marking…' : 'Mark false'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Complaint Details (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Reported by</p>
                      <p className="font-semibold text-gray-900">{complaint.userName}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-violet-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Reported on</p>
                      <p className="font-semibold text-gray-900">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Category</p>
                      <p className="font-semibold text-gray-900">{complaint.assetCategory?.replace('_', ' ') || 'OTHER'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Priority</p>
                      <p className="font-semibold text-gray-900">{complaint.priority.toLowerCase()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-sky-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">
                        {complaint.blockNumber ? `Block ${complaint.blockNumber}` : 'No block'}
                        {complaint.blockNumber && complaint.roomNumber ? ' • ' : ''}
                        {complaint.roomNumber || 'No room'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-primary-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Assigned</p>
                      <p className="font-semibold text-gray-900">{complaint.workerName || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ─────────── Evidence / Image Gallery Section ─────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-primary-500" />
                Evidence & Attachments
                {evidences.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700">
                    {evidences.length}
                  </span>
                )}
              </h3>
            </div>

            {evidences.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No images attached</p>
                <p className="text-gray-400 text-sm mt-1">Evidence images will appear here when uploaded</p>
              </div>
            ) : (
              <>
                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {evidences.map((evidence, index) => (
                    <div
                      key={evidence.id}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
                      style={{
                        aspectRatio: '4/3',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      onClick={() => openLightbox(index)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Thumbnail Image */}
                      <AsyncImage
                        evidence={evidence}
                        className="w-full h-full object-cover"
                        style={{ transition: 'transform 0.4s ease' }}
                        onError={(e) => {
                          console.error('Thumbnail failed to load:', evidence.fileName);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        api={api}
                        baseURL={baseURL}
                        imageUrls={imageUrls}
                        setImageUrls={setImageUrls}
                      />
                      {/* Fallback if image fails to load */}
                      <div
                        className="w-full h-full items-center justify-center bg-gray-100"
                        style={{ display: 'none' }}
                      >
                        <ImageIcon className="h-10 w-10 text-gray-300" />
                      </div>

                      {/* Hover overlay */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                          transition: 'opacity 0.3s ease'
                        }}
                      >
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); openLightbox(index); }}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                            style={{ border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s ease' }}
                            title="View full size"
                          >
                            <Maximize2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadFile(evidence); }}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                            style={{ border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s ease' }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteEvidence(evidence.id); }}
                              className="p-2 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white backdrop-blur-sm"
                              style={{ border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s ease' }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Bottom file info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-xs font-medium truncate">{evidence.fileName}</p>
                          <p className="text-white/70 text-xs">{formatFileSize(evidence.fileSize)}</p>
                        </div>

                        {/* Center zoom icon */}
                        <ZoomIn className="h-8 w-8 text-white/80" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Gallery summary bar */}
                <div className="mt-4 flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-500">
                  <span className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1.5" />
                    {evidences.length} image{evidences.length !== 1 ? 's' : ''} attached
                  </span>
                  <span>
                    Total: {formatFileSize(evidences.reduce((acc, e) => acc + (e.fileSize || 0), 0))}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Information Panel */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Complaint Info Summary - Always visible */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Complaint Info</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-medium text-gray-900">#{complaint.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Attachments:</span>
                  <span className="font-medium text-gray-900">
                    {evidences.length} image{evidences.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {complaint.resolvedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolved:</span>
                    <span className="font-medium text-green-600">
                      {new Date(complaint.resolvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
