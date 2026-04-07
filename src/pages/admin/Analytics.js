import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  FileText,
  Search,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics = () => {
  const { api } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [selectedPeriod]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/complaints?size=1000&sortBy=createdAt&sortDir=desc`);
      let allComplaints = response.data.content || response.data || [];
      
      // Filter by selected period
      const now = new Date();
      const filteredComplaints = allComplaints.filter(complaint => {
        const complaintDate = new Date(complaint.createdAt);
        const daysDiff = (now - complaintDate) / (1000 * 60 * 60 * 24);
        
        if (selectedPeriod === 'today') {
          return daysDiff < 1;
        } else if (selectedPeriod === '7') {
          return daysDiff <= 7;
        } else if (selectedPeriod === '30') {
          return daysDiff <= 30;
        }
        return true;
      });
      
      setComplaints(filteredComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(31, 41, 55);
      doc.text('Complaints Report', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text(`Period: ${selectedPeriod === 'today' ? 'Today' : `Last ${selectedPeriod} days`}`, 20, 30);
      doc.text(`Total Complaints: ${complaints.length}`, 20, 37);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 44);

      // Summary Stats
      const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
      const pending = complaints.filter(c => c.status === 'PENDING').length;
      const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
      
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Summary', 20, 60);
      
      const summaryData = [
        ['Status', 'Count', 'Percentage'],
        ['Resolved', resolved, `${((resolved / complaints.length) * 100).toFixed(1)}%`],
        ['In Progress', inProgress, `${((inProgress / complaints.length) * 100).toFixed(1)}%`],
        ['Pending', pending, `${((pending / complaints.length) * 100).toFixed(1)}%`]
      ];
      
      autoTable(doc, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 }
      });

      // Complaints List
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Complaints List', 20, doc.lastAutoTable.finalY + 15);
      
      const complaintsData = complaints.map(complaint => {
        const created = new Date(complaint.createdAt);
        const resolved = complaint.status === 'RESOLVED' ? 
          new Date(complaint.resolvedAt || complaint.updatedAt) : null;
        const resolutionTime = resolved ? 
          Math.round((resolved - created) / (1000 * 60 * 60)) : 'N/A';
        
        return [
          complaint.id || '',
          complaint.title?.substring(0, 40) + (complaint.title?.length > 40 ? '...' : ''),
          complaint.status || '',
          complaint.priority || '',
          complaint.assetCategory?.replace('_', ' ') || '',
          new Date(complaint.createdAt || '').toLocaleDateString(),
          resolutionTime,
          complaint.workerName || 'Unassigned'
        ];
      });
      
      autoTable(doc, {
        head: [['ID', 'Title', 'Status', 'Priority', 'Category', 'Date', 'Time (h)', 'Assigned To']],
        body: complaintsData,
        startY: doc.lastAutoTable.finalY + 10,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 15 },
          7: { cellWidth: 20 }
        }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`complaints-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.id?.toString().includes(searchTerm) ||
                         complaint.workerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || complaint.assetCategory === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  const pending = complaints.filter(c => c.status === 'PENDING').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Complaints Analytics</h1>
          <p className="text-gray-500 italic">Comprehensive insights into complaint management performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="today" className="text-gray-900">Today</option>
            <option value="7" className="text-gray-900">Last 7 Days</option>
            <option value="30" className="text-gray-900">Last 30 Days</option>
          </select>
          
          <button
            onClick={generatePDFReport}
            disabled={exporting}
            className="bg-primary-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center shadow-md"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </button>
        </div>
        
        {/* Background decorative */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-24 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-24 w-24 rounded-full bg-white/5 blur-2xl"></div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">{complaints.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-lg font-bold text-green-600">{resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-lg font-bold text-blue-600">{inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-bold text-yellow-600">{pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, ID, or assigned to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="RESOLVED">Resolved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PENDING">Pending</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Categories</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="CARPENTRY">Carpentry</option>
            <option value="HVAC">HVAC</option>
            <option value="PAINTING">Painting</option>
            <option value="CLEANING">Cleaning</option>
            <option value="SECURITY">Security</option>
            <option value="OTHER">Other</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
              setCategoryFilter('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Complaints List ({filteredComplaints.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{complaint.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="truncate">{complaint.title}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {complaint.assetCategory?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {complaint.workerName || 'Unassigned'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
