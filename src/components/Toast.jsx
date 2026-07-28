import { useState, useCallback } from 'react';

/**
 * Toast notification component and hook
 */

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { ...toast, id }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast--${toast.type || 'info'}`}>
          <span className="toast__icon">
            {toast.type === 'error' ? '❌' : toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
          <div className="toast__content">
            <div className="toast__title">{toast.title}</div>
            <div className="toast__message">{toast.message}</div>
            {toast.suggestion && (
              <div className="toast__message" style={{ marginTop: '4px', fontStyle: 'italic', opacity: 0.8 }}>
                {toast.suggestion}
              </div>
            )}
          </div>
          <button className="toast__close" onClick={() => onRemove(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
