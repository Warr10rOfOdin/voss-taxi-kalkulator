/**
 * Toast Notification System
 *
 * Context-based toast notifications for user feedback.
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Success!', 'success');
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = toastId++;

    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.95)', border: '#10b981' },
    error: { bg: 'rgba(231, 76, 60, 0.95)', border: '#e74c3c' },
    warning: { bg: 'rgba(245, 158, 11, 0.95)', border: '#f59e0b' },
    info: { bg: 'rgba(59, 130, 246, 0.95)', border: '#3b82f6' }
  };

  const color = colors[toast.type] || colors.info;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const icon = icons[toast.type] || icons.info;

  return (
    <div
      style={{
        background: color.bg,
        border: `1px solid ${color.border}`,
        borderRadius: '8px',
        padding: '14px 16px',
        color: 'white',
        fontSize: '0.95rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideIn 0.3s ease-out',
        cursor: 'pointer'
      }}
      onClick={() => onRemove(toast.id)}
      role="alert"
    >
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{icon}</div>
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(toast.id);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: '0 4px',
          opacity: 0.8
        }}
        aria-label="Close"
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ToastProvider;
