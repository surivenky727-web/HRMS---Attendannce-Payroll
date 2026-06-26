import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RECENT_SEARCH_KEY = 'hrms-recent-searches';

const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Open the main workspace overview',
    category: 'Navigation',
    keywords: ['home', 'overview', 'workspace'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10Z" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin' : '/me'),
    roles: ['admin', 'employee'],
  },
  {
    id: 'employees',
    title: 'Employees',
    subtitle: 'Manage employee records',
    category: 'People',
    keywords: ['staff', 'people', 'directory', 'team'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin/employees' : '/me/profile'),
    roles: ['admin'],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    subtitle: 'Review attendance records',
    category: 'Workflow',
    keywords: ['time', 'check-in', 'hours', 'presence'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin/attendance' : '/me/attendance'),
    roles: ['admin', 'employee'],
  },
  {
    id: 'leaves',
    title: 'Leaves',
    subtitle: 'Open leave requests and approvals',
    category: 'Workflow',
    keywords: ['time off', 'vacation', 'requests', 'leave'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
        <path d="M5 8v13h14V8" />
        <path d="M7 12h10" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin/leaves' : '/me/leaves'),
    roles: ['admin', 'employee'],
  },
  {
    id: 'payroll',
    title: 'Payroll',
    subtitle: 'View payroll processing and payslips',
    category: 'Finance',
    keywords: ['salary', 'pay', 'wages', 'payslips'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin/payroll' : '/me/payslips'),
    roles: ['admin', 'employee'],
  },
  {
    id: 'departments',
    title: 'Departments',
    subtitle: 'Browse teams and department details',
    category: 'People',
    keywords: ['teams', 'groups', 'organization'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M12 7h.01" />
      </svg>
    ),
    path: ({ role }) => '/admin/departments',
    roles: ['admin'],
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'Review analytics and custom reports',
    category: 'Analytics',
    keywords: ['reports', 'analytics', 'insights'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 2 2 5-5" />
      </svg>
    ),
    path: ({ role }) => '/admin/reports',
    roles: ['admin'],
  },
  {
    id: 'profile',
    title: 'Profile',
    subtitle: 'Open your personal profile settings',
    category: 'Account',
    keywords: ['account', 'profile', 'settings'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    path: ({ role }) => '/me/profile',
    roles: ['employee'],
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Open application and account preferences',
    category: 'Account',
    keywords: ['preferences', 'options', 'configuration'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6V4a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15Z" />
      </svg>
    ),
    path: ({ role }) => (role === 'admin' ? '/admin/settings' : '/me/settings'),
    roles: ['admin', 'employee'],
  },
];

const getShortcutLabel = () => {
  if (typeof navigator === 'undefined') return 'Ctrl K';
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
};

const normalize = (value = '') => value.toLowerCase().trim();

export default function SearchPalette() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef(null);

  const visibleItems = useMemo(() => {
    const normalizedQuery = normalize(debouncedQuery);
    const role = user?.role || 'employee';

    return navigationItems
      .filter((item) => item.roles.includes(role))
      .filter((item) => {
        if (!normalizedQuery) return true;
        const haystack = [item.title, item.subtitle, item.category, ...(item.keywords || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
  }, [debouncedQuery, user?.role]);

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_SEARCH_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setSelectedIndex(0);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handleWindowKeyDown = (event) => {
      const isCommand = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isCommand) {
        event.preventDefault();
        setOpen(true);
        setQuery('');
        return;
      }

      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (visibleItems.length === 0) return;
        setSelectedIndex((current) => Math.min(current + 1, visibleItems.length - 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (visibleItems.length === 0) return;
        setSelectedIndex((current) => Math.max(current - 1, 0));
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [open, visibleItems.length]);

  useEffect(() => {
    const openListener = () => {
      setOpen(true);
      setQuery('');
    };
    window.addEventListener('openSearchPalette', openListener);
    return () => window.removeEventListener('openSearchPalette', openListener);
  }, []);

  useEffect(() => {
    if (!recentSearches.length) return;
    window.localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(recentSearches.slice(0, 5)));
  }, [recentSearches]);

  const currentResults = useMemo(() => visibleItems, [visibleItems]);
  const selectedId = currentResults[selectedIndex]?.id;
  const activeResult = currentResults[selectedIndex];

  useEffect(() => {
    setSelectedIndex((current) => Math.max(0, Math.min(current, currentResults.length - 1)));
  }, [currentResults.length]);

  const storeRecentSearch = useCallback((term) => {
    setRecentSearches((previous) => {
      const next = [term, ...previous.filter((item) => item !== term)].slice(0, 5);
      return next;
    });
  }, []);

  const navigateToItem = useCallback(
    (item) => {
      if (!item) return;
      const target = typeof item.path === 'function' ? item.path({ role: user?.role }) : item.path;
      if (!target) return;
      setOpen(false);
      setQuery('');
      navigate(target);
      storeRecentSearch(item.title);
    },
    [navigate, storeRecentSearch, user?.role]
  );

  const handleResultClick = (index) => {
    const item = currentResults[index];
    if (!item) return;
    navigateToItem(item);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeResult) {
      navigateToItem(activeResult);
    }
  };

  const shownRecentSearches = recentSearches.filter((term) => normalize(term).includes(normalize(query))); 

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        >
          <motion.div
            className="search-palette-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-palette-title"
          >
            <div className="search-palette-header">
              <div>
                <p id="search-palette-title" className="search-palette-title">Quick actions</p>
                <p className="search-palette-subtitle">Search pages, leave requests, payroll, attendance and more.</p>
              </div>
              <div className="search-palette-hint">{getShortcutLabel()}</div>
            </div>

            <form className="search-palette-form" onSubmit={handleSubmit}>
              <span className="search-palette-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                ref={inputRef}
                className="search-palette-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employees, departments, attendance..."
                autoComplete="off"
                aria-label="Search commands"
              />
            </form>

            <div className="search-palette-body">
              {currentResults.length > 0 ? (
                <div className="search-result-list" role="listbox" aria-activedescendant={selectedId ? `search-result-${selectedId}` : undefined}>
                  {currentResults.map((item, index) => (
                    <button
                      id={`search-result-${item.id}`}
                      key={item.id}
                      type="button"
                      className={`search-result-item${index === selectedIndex ? ' active' : ''}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      onClick={() => handleResultClick(index)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="search-result-icon">{item.icon}</span>
                      <span className="search-result-text">
                        <span className="search-result-title">{item.title}</span>
                        <span className="search-result-subtitle">{item.subtitle}</span>
                      </span>
                      <span className="search-result-meta">
                        <span className="search-result-category">{item.category}</span>
                        <span className="search-result-keyhint">Enter</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="search-empty-state">
                  <p className="search-empty-title">No matches found</p>
                  <p className="search-empty-copy">Try searching for an employee name, department, payroll record, or page.</p>
                  <div className="search-empty-suggestions">
                    <span>Try:</span>
                    <ul>
                      <li>Jane Doe</li>
                      <li>Marketing department</li>
                      <li>Leave requests</li>
                      <li>Payroll</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {!query && shownRecentSearches.length > 0 && (
              <div className="search-recent-section">
                <div className="search-recent-heading">Recent searches</div>
                <div className="search-recent-list">
                  {shownRecentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="search-recent-chip"
                      onClick={() => {
                        setQuery(term);
                        setDebouncedQuery(term);
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
