import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose }) => {
  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }[type] || 'bg-gray-50 border-gray-200';

  const textColor = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  }[type] || 'text-gray-800';

  return (
    <div className={`${bgColor} border rounded-lg p-4 shadow-lg flex gap-3 items-start animate-in fade-in slide-in-from-top-2`}>
      <div className="flex-1">
        <h3 className={`${textColor} font-semibold text-sm`}>{title}</h3>
        {message && <p className={`${textColor} text-sm opacity-90 mt-1`}>{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${textColor} hover:opacity-70 transition-opacity`}
      >
        <X size={18} />
      </button>
    </div>
  );
};

interface ToasterProps {
  toasts: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
  }>;
  onClose: (id: string) => void;
}

export const Toaster: React.FC<ToasterProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
};
