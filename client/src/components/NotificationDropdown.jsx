import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotifications } from '../context/NotificationsContext.jsx';

const typeStyles = {
  success: { icon: '✅', label: 'Success', ring: 'ring-success/20', bg: 'bg-success-50' },
  warning: { icon: '⚠️', label: 'Warning', ring: 'ring-warning/20', bg: 'bg-warning-50' },
  error: { icon: '⛔', label: 'Error', ring: 'ring-danger/20', bg: 'bg-danger-50' },
  info: { icon: 'ℹ️', label: 'Info', ring: 'ring-primary/20', bg: 'bg-primary-50' },
};

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [notifications]
  );

  const emptyState = (
    <div className="notification-empty">
      <div className="notification-empty-icon">🎉</div>
      <h3 className="notification-empty-title">You're all caught up!</h3>
      <p className="notification-empty-copy">No new updates yet. Check back later for HR alerts and status changes.</p>
    </div>
  );

  return (
    <div
      ref={panelRef}
      className={`notification-dropdown ${isOpen ? 'open' : ''} ${mounted ? 'animate-ready' : ''}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="notification-dropdown-title"
    >
      <div className="notification-dropdown-header">
        <div>
          <p id="notification-dropdown-title" className="notification-dropdown-title">Notifications</p>
          <p className="notification-dropdown-subtitle">{unreadCount} unread</p>
        </div>
        <button type="button" className="notification-action" onClick={markAllAsRead}>Mark all as read</button>
      </div>

      <div className="notification-list-wrapper">
        {sortedNotifications.length === 0 ? (
          emptyState
        ) : (
          <ul className="notification-list" role="list">
            {sortedNotifications.map((notification) => {
              const style = typeStyles[notification.type] || typeStyles.info;
              return (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className={`notification-icon ${style.ring}`}>
                    <span>{style.icon}</span>
                  </div>
                  <div className="notification-body">
                    <div className="notification-title-row">
                      <p className="notification-title">{notification.title}</p>
                      <div className="notification-meta">
                        {!notification.read && <span className="notification-status">New</span>}
                        <span className="notification-time">{formatTime(notification.timestamp)}</span>
                      </div>
                    </div>
                    <p className="notification-description">{notification.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="notification-dropdown-footer">
        <button type="button" className="notification-view-all">View all notifications</button>
      </div>
    </div>
  );
}
