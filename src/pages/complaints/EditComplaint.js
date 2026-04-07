import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  MapPin,
  AlertTriangle,
  Camera,
  Upload,
  FileText,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useEscapeBack from '../../hooks/useEscapeBack';

const EditComplaint = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    blockNumber: '',
    buildingNumber: '',
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
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const backPath = location.state?.from || `/complaints/${id}`;

  useEscapeBack({
    enabled: true,
    onEscape: () => navigate(backPath),
    shouldHandle: () => !loading && !fetchLoading && !document.querySelector('[data-camera-capture-modal="true"]')
  });

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await api.get(`/complaints/${id}`);
      const complaint = response.data;
      
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        blockNumber: complaint.blockNumber || '',
        buildingNumber: complaint.buildingNumber || '',
        roomNumber: complaint.roomNumber || '',
        priority: complaint.priority || 'MEDIUM',
        assetCategory: complaint.assetCategory || 'OTHER'
      });
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Failed to load complaint details');
      navigate('/complaints');
    } finally {
      setFetchLoading(false);
    }
  };

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
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
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
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Sending update request:', formData);
      console.log('Updating complaint ID:', id);
      
      const response = await api.put(`/complaints/${id}`, formData);
      console.log('Update response:', response);
      
      // Upload new files if any
      if (files.length > 0) {
        console.log('Uploading additional files...');
        const uploadFormData = new FormData();
        files.forEach((file) => {
          uploadFormData.append('files', file);
        });
        
        try {
          await api.post(`/complaints/${id}/upload`, uploadFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Additional files uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading additional files:', uploadError);
          toast.error('Files uploaded but some additional files failed');
        }
      }
      
      toast.success('Complaint updated successfully!');
      
      // Navigate to complaint details
      navigate(`/complaints/${id}`);
    } catch (error) {
      console.error('Error updating complaint:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update complaint');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative shadow-lg">
        <div className="relative z-10">
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center text-primary-100 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Complaint
          </button>
          <h1 className="text-3xl font-bold mb-2">Edit Complaint</h1>
          <p className="text-primary-100 italic">Update the information for this infrastructure report</p>
        </div>
        {/* Decorative element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
      </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter complaint title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the issue in detail"
                  required
                />
              </div>

              {/* Location Section */}
              <div>
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="blockNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Block (A, B, C...)
                    </label>
                    <input
                      type="text"
                      id="blockNumber"
                      name="blockNumber"
                      value={formData.blockNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      maxLength="1"
                      placeholder="M"
                    />
                  </div>
                  <div>
                    <label htmlFor="buildingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Building Number
                    </label>
                    <input
                      type="text"
                      id="buildingNumber"
                      name="buildingNumber"
                      value={formData.buildingNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 1, 2, 3"
                    />
                  </div>
                  <div>
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 101, 201"
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
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low - Minor</option>
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
                  Add More Evidence (Optional)
                </label>
                
                {/* Camera and Upload Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Camera Capture */}
                  <div 
                    onClick={handleCameraCapture}
                    className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50"
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
                      id="file-upload-edit"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload-edit" className="cursor-pointer">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-primary-600 hover:text-primary-500">📁 Upload Files</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF, DOC
                      </p>
                    </label>
                  </div>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        New Files to Add ({files.length})
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(backPath)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default EditComplaint;
