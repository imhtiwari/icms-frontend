import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Upload, 
  X, 
  Camera, 
  ArrowLeft,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import useEscapeBack from '../../hooks/useEscapeBack';

const CreateComplaint = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [userStrikeInfo, setUserStrikeInfo] = useState({
    strikeCount: 0,
    complaintBannedUntil: null,
    banReason: null,
    canSubmitComplaints: true,
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    blockNumber: '',
    roomNumber: '',
    priority: 'MEDIUM',
    assetCategory: 'OTHER'
  });

  const categories = [
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'IT_INFRASTRUCTURE', label: 'IT / Computer' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'AIR_CONDITIONING', label: 'AC / Cooling' },
    { value: 'LIFT', label: 'Lift / Elevator' },
    { value: 'CLEANING', label: 'Cleaning / Housekeeping' },
    { value: 'BUILDING_MAINTENANCE', label: 'Building / Civil' },
    { value: 'OTHER', label: 'Other' },
  ];
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserStrikeInfo = async () => {
      try {
        const response = await api.get('/users/profile');
        setUserStrikeInfo({
          strikeCount: response.data?.strikeCount || 0,
          complaintBannedUntil: response.data?.complaintBannedUntil || null,
          banReason: response.data?.banReason || null,
          canSubmitComplaints: response.data?.canSubmitComplaints !== false,
        });
      } catch (error) {
        console.error('Error fetching user strike info:', error);
      }
    };

    fetchUserStrikeInfo();
  }, [api]);

  const isComplaintSubmissionBlocked = user?.role === 'USER' && userStrikeInfo.canSubmitComplaints === false;

  useEscapeBack({
    enabled: true,
    onEscape: () => navigate('/complaints'),
    shouldHandle: () => !uploading && !document.querySelector('[data-camera-capture-modal="true"]')
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for blockNumber to only allow a single capital letter
    if (name === 'blockNumber') {
      const upperValue = value.toUpperCase();
      if (upperValue === '' || /^[A-Z]$/.test(upperValue)) {
        setFormData({
          ...formData,
          [name]: upperValue
        });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleCameraCapture = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element to show camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Create modal for camera capture
      const modal = document.createElement('div');
      modal.dataset.cameraCaptureModal = 'true';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const container = document.createElement('div');
      container.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90%;
        position: relative;
      `;
      
      const videoContainer = document.createElement('div');
      videoContainer.style.cssText = `
        position: relative;
        margin-bottom: 10px;
      `;
      
      video.style.cssText = `
        max-width: 100%;
        max-height: 60vh;
        border-radius: 8px;
      `;
      
      const captureButton = document.createElement('button');
      captureButton.textContent = '📸 Capture Photo';
      captureButton.style.cssText = `
        background: #3b82f6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 16px;
      `;
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = '❌ Cancel';
      cancelButton.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        text-align: center;
      `;
      
      videoContainer.appendChild(video);
      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      container.appendChild(videoContainer);
      container.appendChild(buttonContainer);
      modal.appendChild(container);
      document.body.appendChild(modal);
      
      const capturePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFiles(prev => [...prev, file]);
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
          
          toast.success('Photo captured successfully!');
        }, 'image/jpeg', 0.9);
      };
      
      captureButton.onclick = capturePhoto;
      cancelButton.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      // Close modal on background click
      modal.onclick = (e) => {
        if (e.target === modal) {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        }
      };
      
    } catch (error) {
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Failed to access camera: ' + error.message);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isComplaintSubmissionBlocked) {
      toast.error(userStrikeInfo.banReason || 'You cannot submit new complaints right now.');
      return;
    }

    if (files.length === 0) {
      toast.error('At least one complaint image is required');
      return;
    }
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('description', formData.description);
      submissionData.append('blockNumber', formData.blockNumber || '');
      submissionData.append('buildingNumber', formData.buildingNumber || '');
      submissionData.append('roomNumber', formData.roomNumber || '');
      submissionData.append('priority', formData.priority);
      submissionData.append('assetCategory', formData.assetCategory);
      files.forEach((file) => submissionData.append('files', file));

      const response = await api.post('/complaints/submit', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.autoRejected) {
        const banUntil = response.data?.complaintBannedUntil;
        const rejectionMessage = banUntil
          ? `Complaint auto-rejected. You now have ${response.data?.strikeCount || 0} strikes and cannot file new complaints until ${new Date(banUntil).toLocaleString()}.`
          : response.data?.reviewReason || 'Complaint was automatically rejected because the image looked unrelated.';
        toast.error(rejectionMessage);
        navigate(`/complaints/${response.data.id}`);
        return;
      }

      toast.success('Complaint created successfully!');
      navigate(`/complaints/${response.data.id}`);
    } catch (error) {
      console.error('Error creating complaint:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error statusText:', error.response?.statusText);
      
      if (error.response?.status === 403) {
        toast.error('Permission denied. You may not have the correct role to create complaints.');
      } else if (error.response?.status === 429) {
        toast.error('Image review service is temporarily unavailable. Please try again in a few minutes.');
      } else if (error.response?.data?.message?.includes('Gemini image review failed')) {
        toast.error('Image review service is temporarily unavailable. Your complaint will be submitted without image verification.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create complaint');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/complaints"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Complaints
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Complaint</h1>
            <p className="text-gray-600 mt-1">Report infrastructure issues in your college</p>
          </div>
        </div>
      </div>

      {isComplaintSubmissionBlocked && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-orange-900">Complaint filing paused</h2>
          <p className="mt-2 text-sm text-orange-800">
            You cannot submit new complaints until{' '}
            {userStrikeInfo.complaintBannedUntil ? new Date(userStrikeInfo.complaintBannedUntil).toLocaleString() : 'your restriction ends'}.
          </p>
          {userStrikeInfo.banReason && (
            <p className="mt-2 text-sm text-orange-700">{userStrikeInfo.banReason}</p>
          )}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                required
                disabled={isComplaintSubmissionBlocked}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows="4"
              disabled={isComplaintSubmissionBlocked}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Provide detailed information about the issue, including when it started and how it affects you"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blockNumber" className="block text-xs font-medium text-gray-600 mb-1">
                  Block (A, B, C...)
                </label>
                <input
                  type="text"
                  id="blockNumber"
                  name="blockNumber"
                  disabled={isComplaintSubmissionBlocked}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  maxLength="1"
                  placeholder="M"
                  value={formData.blockNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="roomNumber" className="block text-xs font-medium text-gray-600 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  id="roomNumber"
                  name="roomNumber"
                  disabled={isComplaintSubmissionBlocked}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 009, 876"
                  value={formData.roomNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assetCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Category
              </label>
              <select
                id="assetCategory"
                name="assetCategory"
                disabled={isComplaintSubmissionBlocked}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.assetCategory}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                Priority Level
              </label>
              <select
                id="priority"
                name="priority"
                disabled={isComplaintSubmissionBlocked}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low - Minor issue</option>
                <option value="MEDIUM">Medium - Normal</option>
                <option value="HIGH">High - Important</option>
                <option value="URGENT">Urgent - Critical</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Attach Evidence Image *
            </label>
            
            {/* Camera and Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Camera Capture */}
              <div 
                onClick={isComplaintSubmissionBlocked ? undefined : handleCameraCapture}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isComplaintSubmissionBlocked ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : 'border-blue-300 hover:border-blue-400 cursor-pointer bg-blue-50'}`}
              >
                <Camera className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <div className="text-sm text-blue-600">
                  <span className="font-medium">📸 Take Photo</span>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  Use device camera
                </p>
              </div>
              
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isComplaintSubmissionBlocked}
                  className="hidden"
                />
                <label htmlFor="file-upload" className={isComplaintSubmissionBlocked ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600 hover:text-primary-500">📁 Upload Files</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WEBP
                  </p>
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              At least one image is required. Complaints with clearly unrelated images can be automatically rejected.
            </p>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Evidence Files ({files.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => {
                  const isCameraPhoto = file.name.startsWith('camera-photo-');
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isCameraPhoto ? (
                          <Camera className="h-5 w-5 text-blue-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                            {isCameraPhoto && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                📸 Camera
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Link
              to="/complaints"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || isComplaintSubmissionBlocked}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
