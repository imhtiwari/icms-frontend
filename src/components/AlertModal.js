import React from 'react';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'warning', // 'warning', 'error', 'success', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancelButton = true 
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          confirmBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          confirmBg: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
        return {
          icon: Info,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          confirmBg: 'bg-blue-600 hover:bg-blue-700'
        };
      default: // warning
        return {
          icon: AlertTriangle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 border-2 border-gray-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className={`flex items-center p-6 border-b ${styles.borderColor}`}>
          <div className={`p-2 rounded-lg ${styles.iconBg} mr-3`}>
            <Icon className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          {showCancelButton && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
