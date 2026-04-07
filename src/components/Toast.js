import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  duration = 5000,
  onClose 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className={`flex items-center p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor} shadow-lg max-w-md`}>
        <div className={`p-1 rounded-full ${styles.iconBg} mr-3`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <p className={`flex-1 font-medium ${styles.textColor}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className={`ml-3 p-1 rounded-full hover:bg-black/10 transition-colors ${styles.textColor}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
