import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNotifications } from '../context/NotificationsContext.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';

const pageTitleMap = {
  '/': 'Home',
  '/login': 'Sign in',
  '/register': 'Register',
  '/forgot-password': 'Forgot password',
  '/reset-password': 'Reset password',
  '/admin': 'Dashboard',
  '/admin/employees': 'Employees',
  '/admin/attendance': 'Attendance',
  '/admin/leaves': 'Leaves',
  '/admin/payroll': 'Payroll',
  '/admin/departments': 'Departments',
  '/admin/reports': 'Reports',
  '/admin/settings': 'Settings',
  '/me': 'Dashboard',
  '/me/attendance': 'Attendance',
  '/me/leaves': 'Leaves',
  '/me/payslips': 'Payslips',
  '/me/profile': 'Profile',
  '/me/settings': 'Settings',
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const toast = useToast();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const nav = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const openGlobalSearch = () => {
    window.dispatchEvent(new Event('openSearchPalette'));
  };

  const pageTitle = pageTitleMap[location.pathname] || 'Workspace';
  const themeLabel = theme === 'system' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark';
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    toast.info('Signed out successfully');
    nav('/login');
  };

  return (
    <header className="topbar sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-sm border-b border-default">
      <div className="topbar-inner flex flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="topbar-left flex items-center gap-4 min-w-0">
          <div className="page-title-wrapper min-w-0">
            <div className="page-title text-lg font-semibold text-primary truncate">{pageTitle}</div>
            <div className="caption text-secondary">{user?.role === 'admin' ? 'Admin workspace' : 'Employee workspace'}</div>
          </div>
        </div>

        <div className="topbar-center flex-1 min-w-[280px] max-w-2xl">
          <form className="search-form" onSubmit={(e) => e.preventDefault()} onClick={openGlobalSearch}>
            <span className="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </span>
            <input
              className="search-input"
              type="search"
              placeholder="Search employees, attendance, payroll..."
              readOnly
              aria-label="Open global search"
              onFocus={openGlobalSearch}
            />
          </form>
        </div>

        <div className="topbar-actions flex items-center gap-2">
          <button className="icon-button" type="button" onClick={cycleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2" />
                <path d="M12 21v2" />
                <path d="M4.22 4.22l1.42 1.42" />
                <path d="M18.36 18.36l1.42 1.42" />
                <path d="M1 12h2" />
                <path d="M21 12h2" />
                <path d="M4.22 19.78l1.42-1.42" />
                <path d="M18.36 5.64l1.42-1.42" />
              </svg>
            )}
            <span className="ml-2 hidden sm:inline text-sm font-medium">{themeLabel}</span>
          </button>

          <div className="notification-menu relative">
            <button
              className="notification-button icon-button"
              type="button"
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <NotificationDropdown isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>

          <div className="profile-dropdown relative" ref={profileRef}>
            <button className="profile-button" type="button" onClick={() => setProfileOpen((open) => !open)} aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={profileOpen}>
              <span className="avatar">{user?.name?.[0]?.toUpperCase() || '?'}</span>
            </button>
            {profileOpen && (
              <div id="profile-menu" className="profile-menu bg-surface border border-default" role="menu">
                <button className="profile-menu-item" type="button" role="menuitem" onClick={() => { setProfileOpen(false); nav(user?.role === 'admin' ? '/admin/settings' : '/me/profile'); }}>
                  View profile
                </button>
                <button className="profile-menu-item" type="button" role="menuitem" onClick={() => { setProfileOpen(false); handleLogout(); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

