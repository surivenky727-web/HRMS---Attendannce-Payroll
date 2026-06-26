import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const makeId = () => `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);
  const timeoutIds = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    if (timeoutIds.current[id]) {
      clearTimeout(timeoutIds.current[id]);
      delete timeoutIds.current[id];
    }
  }, []);

  const addToast = useCallback(
    ({ message, type = 'info', duration = 4200 }) => {
      const id = makeId();
      setToasts((current) => [...current, { id, message, type }]);
      if (duration > 0) {
        timeoutIds.current[id] = window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
          delete timeoutIds.current[id];
        }, duration);
      }
      return id;
    },
    []
  );

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState({ message });
    });
  }, []);

  const handleConfirm = useCallback(
    (result) => {
      if (confirmResolver.current) {
        confirmResolver.current(result);
        confirmResolver.current = null;
      }
      setConfirmState(null);
    },
    []
  );

  const toast = useMemo(
    () => ({
      success: (message, duration) => addToast({ message, type: 'success', duration }),
      error: (message, duration) => addToast({ message, type: 'error', duration }),
      info: (message, duration) => addToast({ message, type: 'info', duration }),
      warning: (message, duration) => addToast({ message, type: 'warning', duration }),
      dismiss: removeToast,
      confirm,
    }),
    [addToast, confirm, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map(({ id, message, type }) => (
          <div key={id} className={`toast ${type}`}>
            <div className="toast-content">{message}</div>
            <button type="button" className="toast-close" onClick={() => removeToast(id)} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
      {confirmState && (
        <div className="toast-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="toast-confirm-panel">
            <div className="toast-confirm-message">{confirmState.message}</div>
            <div className="toast-confirm-actions">
              <button type="button" className="btn-ghost" onClick={() => handleConfirm(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={() => handleConfirm(true)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
