import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Clock, Building,
  CheckCircle, AlertCircle, Loader2, FileText, Calendar, Tag
} from 'lucide-react';
import useEscapeBack from '../../hooks/useEscapeBack';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [worker, setWorker] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);

  useEscapeBack({
    enabled: true,
    onEscape: () => navigate('/workers'),
    shouldHandle: () => !loading
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workerRes, complaintsRes] = await Promise.all([
          api.get(`/workers/${id}`),
          api.get(`/workers/${id}/complaints`)
        ]);
        setWorker(workerRes.data);
        setComplaints(complaintsRes.data || []);
      } catch (error) {
        console.error('Error fetching worker detail:', error);
      } finally {
        setLoading(false);
        setComplaintsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'RESOLVED':   return { cls: 'bg-green-100 text-green-800',  icon: <CheckCircle className="h-3 w-3" />, label: 'Resolved' };
      case 'IN_PROGRESS':return { cls: 'bg-blue-100 text-blue-800',   icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'In Progress' };
      case 'PENDING':    return { cls: 'bg-yellow-100 text-yellow-800',icon: <AlertCircle className="h-3 w-3" />, label: 'Pending' };
      default:           return { cls: 'bg-gray-100 text-gray-800',    icon: <FileText className="h-3 w-3" />, label: status };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH':   return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW':    return 'bg-green-100 text-green-800';
      default:       return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Stats
  const resolved   = complaints.filter(c => c.status === 'RESOLVED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const pending    = complaints.filter(c => c.status === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-16">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Worker Not Found</h2>
        <p className="text-gray-500 mb-6">The worker you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/workers')} className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Back to Workers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* Back Button */}
      <button
        onClick={() => navigate('/workers')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workers Directory
      </button>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <User className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{worker.name}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${worker.active ? 'bg-green-400/30 text-green-100 border border-green-400/40' : 'bg-red-400/30 text-red-100 border border-red-400/40'}`}>
                {worker.active ? '● Active' : '○ Inactive'}
              </span>
            </div>
            <p className="text-primary-200 text-lg">{worker.designation || 'Staff Member'}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white`}>
                {worker.workerType?.replace('_', ' ')}
              </span>
              {worker.department && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
                  {worker.department}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* decorative blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 -ml-12 -mb-12 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Worker Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              {worker.phoneNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${worker.phoneNumber}`} className="text-sm font-medium text-primary-600 hover:underline">
                      {worker.phoneNumber}
                    </a>
                  </div>
                </div>
              )}
              {worker.email && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${worker.email}`} className="text-sm font-medium text-primary-600 hover:underline break-all">
                      {worker.email}
                    </a>
                  </div>
                </div>
              )}
              {worker.officeLocation && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Office Location</p>
                    <p className="text-sm font-medium text-gray-900">{worker.officeLocation}</p>
                  </div>
                </div>
              )}
              {worker.workHours && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Work Hours</p>
                    <p className="text-sm font-medium text-gray-900">{worker.workHours}</p>
                  </div>
                </div>
              )}
              {worker.department && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm font-medium text-gray-900">{worker.department}</p>
                  </div>
                </div>
              )}
            </div>

            {worker.specialization && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Specialization</p>
                <p className="text-sm text-gray-700">{worker.specialization}</p>
              </div>
            )}
          </div>

          {/* Complaint Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Complaint Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Assigned</span>
                <span className="text-lg font-bold text-gray-900">{complaints.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="text-sm font-semibold text-green-600">{resolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-semibold text-blue-600">{inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{pending}</span>
              </div>
              {complaints.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Resolution Rate</p>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((resolved / complaints.length) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {Math.round((resolved / complaints.length) * 100)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Complaints
                <span className="ml-2 text-sm font-normal text-gray-500">({complaints.length})</span>
              </h2>
            </div>

            {complaintsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-gray-600 font-medium">No complaints assigned yet</h3>
                <p className="text-gray-400 text-sm mt-1">This worker hasn't been assigned any complaints.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {complaints.map((complaint) => {
                  const statusConf = getStatusConfig(complaint.status);
                  return (
                    <Link
                      key={complaint.id}
                      to={`/complaints/${complaint.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400 font-mono">#{complaint.id}</span>
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                              {complaint.title}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{complaint.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${statusConf.cls}`}>
                              {statusConf.icon}
                              {statusConf.label}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityConfig(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                            {complaint.assetCategory && (
                              <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                <Tag className="h-3 w-3" />
                                {complaint.assetCategory?.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            }) : '—'}
                          </div>
                          {complaint.userName && (
                            <p className="text-xs text-gray-500 mt-1">By {complaint.userName}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDetail;
