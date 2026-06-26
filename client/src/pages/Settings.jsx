import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const STORAGE_KEY = 'hrms-settings';

const ACCENT_PALETTES = {
  blue: { label: 'Blue', primary: '79 70 229', secondary: '6 182 212' },
  purple: { label: 'Purple', primary: '147 51 234', secondary: '139 92 246' },
  green: { label: 'Green', primary: '16 185 129', secondary: '52 211 153' },
  orange: { label: 'Orange', primary: '249 115 22', secondary: '251 146 60' },
};

const defaultSettings = {
  appearance: {
    theme: 'system',
    accent: 'blue',
    compactMode: false,
  },
  notifications: {
    email: true,
    browser: true,
    payroll: true,
    leave: false,
    attendance: true,
    sound: true,
  },
  dashboard: {
    welcomeCard: true,
    analytics: true,
    quickActions: true,
    recentActivity: true,
    defaultView: 'Overview',
  },
  security: {
    twoFactor: false,
    activeSessions: 1,
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    keyboardNav: true,
  },
  about: {
    language: 'English',
    timeZone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  },
};

const tabs = [
  { key: 'Appearance', label: 'Appearance', icon: '🎨', description: 'Theme, accent, and layout preferences.' },
  { key: 'Notifications', label: 'Notifications', icon: '🔔', description: 'Manage alert channels and notification types.' },
  { key: 'Dashboard', label: 'Dashboard', icon: '📊', description: 'Configure the dashboard experience.' },
  { key: 'Security', label: 'Security', icon: '🛡️', description: 'Passwords and privacy controls.' },
  { key: 'Accessibility', label: 'Accessibility', icon: '♿', description: 'Improve readability and navigation.' },
  { key: 'About', label: 'About', icon: 'ℹ️', description: 'Application info and language settings.' },
];

const accentOptions = Object.entries(ACCENT_PALETTES).map(([value, palette]) => ({ value, ...palette }));
const defaultAccent = defaultSettings.appearance.accent;

const applyAccent = (accent) => {
  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES[defaultAccent];
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--color-primary-rgb', palette.primary);
    document.documentElement.style.setProperty('--color-secondary-rgb', palette.secondary);
  }
};

const applyCompactMode = (enabled) => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('compact-mode', enabled);
  }
};

export default function Settings() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Appearance');
  const [settings, setSettings] = useState(defaultSettings);
  const [savedSettings, setSavedSettings] = useState(defaultSettings);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    const loaded = parsed ? { ...defaultSettings, ...parsed } : defaultSettings;
    setSettings(loaded);
    setSavedSettings(loaded);
    setTheme(loaded.appearance.theme);
    applyAccent(loaded.appearance.accent);
    applyCompactMode(loaded.appearance.compactMode);
  }, [setTheme]);

  const unsaved = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const updateSection = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    const next = { ...settings };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedSettings(next);
    setTheme(next.appearance.theme);
    applyAccent(next.appearance.accent);
    applyCompactMode(next.appearance.compactMode);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSavedSettings(defaultSettings);
    window.localStorage.removeItem(STORAGE_KEY);
    setTheme(defaultSettings.appearance.theme);
    applyAccent(defaultSettings.appearance.accent);
    applyCompactMode(defaultSettings.appearance.compactMode);
    toast.success('Settings have been reset to defaults');
  };

  return (
    <div className="settings-shell animate-page space-y-6">
      <div className="page-header">
        <div>
          <h1 className="heading-2 mb-1">Settings Center</h1>
          <p className="body text-secondary">Manage your enterprise preferences with a modern settings workflow.</p>
        </div>
        <div className="settings-actions flex flex-wrap items-center gap-3">
          {unsaved && <span className="settings-chip">Unsaved Changes</span>}
          <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset to default</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
        </div>
      </div>

      <div className="settings-layout grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="settings-nav card p-5">
          <div className="nav-title">
            <h2 className="text-lg font-semibold">Sections</h2>
            <p className="text-sm text-secondary">Browse settings by category.</p>
          </div>
          <div className="settings-tab-list mt-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`settings-tab ${tab.key === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className="settings-tab-icon" aria-hidden="true">{tab.icon}</span>
                <span>
                  <span className="block font-semibold">{tab.label}</span>
                  <span className="text-sm text-secondary">{tab.description}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="settings-panel card p-5">
          <div className="settings-panel-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">{activeTab}</h2>
              <p className="text-sm text-secondary">{tabs.find((tab) => tab.key === activeTab)?.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {unsaved && <span className="settings-chip">Unsaved changes</span>}
              <button type="button" className="btn btn-ghost" onClick={handleReset}>Reset</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>

          <div className="settings-content mt-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                {activeTab === 'Appearance' && (
                  <div className="settings-grid">
                    <section className="settings-card">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Appearance</h3>
                        <p className="text-sm text-secondary">Choose theme and layout options.</p>
                      </div>
                      <div className="settings-card-body space-y-5">
                        <div className="settings-group">
                          <label className="label">Theme mode</label>
                          <div className="settings-pill-group">
                            {['light', 'dark', 'system'].map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                className={`settings-pill ${settings.appearance.theme === mode ? 'active' : ''}`}
                                onClick={() => updateSection('appearance', 'theme', mode)}
                              >
                                {mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="settings-group">
                          <label className="label">Accent color</label>
                          <div className="settings-pill-group">
                            {accentOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                className={`settings-pill accent ${settings.appearance.accent === option.value ? 'active' : ''}`}
                                onClick={() => updateSection('appearance', 'accent', option.value)}
                              >
                                <span className="accent-swatch" style={{ backgroundColor: `rgb(${option.primary})` }} />
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="settings-group settings-switch-row">
                          <div>
                            <p className="font-semibold">Compact mode</p>
                            <p className="text-sm text-secondary">Reduce spacing for a denser interface.</p>
                          </div>
                          <label className="settings-switch">
                            <input
                              type="checkbox"
                              checked={settings.appearance.compactMode}
                              onChange={(event) => updateSection('appearance', 'compactMode', event.target.checked)}
                            />
                            <span className="settings-switch-track" />
                          </label>
                        </div>
                      </div>
                    </section>

                    <section className="settings-card">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Layout preview</h3>
                        <p className="text-sm text-secondary">Preview the look and feel of your interface.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        <div className="preview-pill-group">
                          <span className="preview-pill">{settings.appearance.theme === 'system' ? 'Auto theme' : `${settings.appearance.theme} theme`}</span>
                          <span className="preview-pill">Accent: {ACCENT_PALETTES[settings.appearance.accent].label}</span>
                          {settings.appearance.compactMode && <span className="preview-pill">Compact mode enabled</span>}
                        </div>
                        <div className="preview-banner card bg-surface border border-default p-4">
                          <p className="font-semibold">Theme preview panel</p>
                          <p className="text-sm text-secondary">Saved appearance settings apply immediately when saved.</p>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'Notifications' && (
                  <div className="settings-grid">
                    <section className="settings-card w-full">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-sm text-secondary">Manage your notification channels and alerts.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        {[
                          { key: 'email', label: 'Email notifications' },
                          { key: 'browser', label: 'Browser notifications' },
                          { key: 'payroll', label: 'Payroll alerts' },
                          { key: 'leave', label: 'Leave alerts' },
                          { key: 'attendance', label: 'Attendance alerts' },
                          { key: 'sound', label: 'Sound notifications' },
                        ].map((item) => (
                          <div key={item.key} className="settings-switch-row">
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-sm text-secondary">Enable or disable this notification type.</p>
                            </div>
                            <label className="settings-switch">
                              <input
                                type="checkbox"
                                checked={settings.notifications[item.key]}
                                onChange={(event) => updateSection('notifications', item.key, event.target.checked)}
                              />
                              <span className="settings-switch-track" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'Dashboard' && (
                  <div className="settings-grid">
                    <section className="settings-card w-full">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Dashboard Preferences</h3>
                        <p className="text-sm text-secondary">Configure your workspace dashboard experience.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        {[
                          { key: 'welcomeCard', label: 'Show welcome card' },
                          { key: 'analytics', label: 'Show analytics' },
                          { key: 'quickActions', label: 'Show quick actions' },
                          { key: 'recentActivity', label: 'Show recent activity' },
                        ].map((item) => (
                          <div key={item.key} className="settings-switch-row">
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-sm text-secondary">Toggle this dashboard section on or off.</p>
                            </div>
                            <label className="settings-switch">
                              <input
                                type="checkbox"
                                checked={settings.dashboard[item.key]}
                                onChange={(event) => updateSection('dashboard', item.key, event.target.checked)}
                              />
                              <span className="settings-switch-track" />
                            </label>
                          </div>
                        ))}

                        <div className="settings-group">
                          <label className="label">Default dashboard view</label>
                          <select
                            className="input"
                            value={settings.dashboard.defaultView}
                            onChange={(event) => updateSection('dashboard', 'defaultView', event.target.value)}
                          >
                            <option>Overview</option>
                            <option>Analytics</option>
                            <option>Tasks</option>
                            <option>Reports</option>
                          </select>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'Security' && (
                  <div className="settings-grid">
                    <section className="settings-card w-full space-y-5">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Security</h3>
                        <p className="text-sm text-secondary">Keep your account trusted and secure.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        <button
                          type="button"
                          className="btn btn-primary w-full"
                          onClick={() => toast.info('Password change is not available in demo mode.')}
                        >
                          Change password
                        </button>
                        <div className="settings-placeholder-card">
                          <div>
                            <h4 className="font-semibold">Two-factor authentication</h4>
                            <p className="text-sm text-secondary">Placeholder UI for 2FA status and setup.</p>
                          </div>
                          <span className="settings-badge">Coming soon</span>
                        </div>
                        <div className="settings-placeholder-card">
                          <div>
                            <h4 className="font-semibold">Active sessions</h4>
                            <p className="text-sm text-secondary">Monitor what devices are currently signed in.</p>
                          </div>
                          <span className="settings-badge">{settings.security.activeSessions} active</span>
                        </div>
                        <div className="settings-placeholder-card gap-4">
                          <div>
                            <h4 className="font-semibold">Logout from all devices</h4>
                            <p className="text-sm text-secondary">Clear all active sessions in one action.</p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => toast.info('Logout from all devices is not available in demo mode.')}
                          >
                            Placeholder
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'Accessibility' && (
                  <div className="settings-grid">
                    <section className="settings-card w-full">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">Accessibility</h3>
                        <p className="text-sm text-secondary">Improve readability, motion, and keyboard support.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        {[
                          { key: 'largeText', label: 'Large text' },
                          { key: 'highContrast', label: 'High contrast' },
                          { key: 'reduceMotion', label: 'Reduce motion' },
                          { key: 'keyboardNav', label: 'Keyboard navigation' },
                        ].map((item) => (
                          <div key={item.key} className="settings-switch-row">
                            <div>
                              <p className="font-semibold">{item.label}</p>
                              <p className="text-sm text-secondary">Improve accessibility across the interface.</p>
                            </div>
                            <label className="settings-switch">
                              <input
                                type="checkbox"
                                checked={settings.accessibility[item.key]}
                                onChange={(event) => updateSection('accessibility', item.key, event.target.checked)}
                              />
                              <span className="settings-switch-track" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'About' && (
                  <div className="settings-grid">
                    <section className="settings-card w-full space-y-5">
                      <div className="settings-card-header">
                        <h3 className="font-semibold">About</h3>
                        <p className="text-sm text-secondary">Application metadata and policies.</p>
                      </div>
                      <div className="settings-card-body space-y-4">
                        <div className="settings-placeholder-card">
                          <div>
                            <h4 className="font-semibold">Application version</h4>
                            <p className="text-sm text-secondary">1.0.0</p>
                          </div>
                        </div>
                        <div className="settings-placeholder-card">
                          <div>
                            <h4 className="font-semibold">Build number</h4>
                            <p className="text-sm text-secondary">2026.06.26.01</p>
                          </div>
                        </div>
                        <div className="settings-placeholder-card">
                          <div>
                            <h4 className="font-semibold">Developer</h4>
                            <p className="text-sm text-secondary">Attendance Payroll HRMS Team</p>
                          </div>
                        </div>
                        <div className="settings-card-divider" />
                        <div className="settings-group">
                          <label className="label">Language</label>
                          <select
                            className="input"
                            value={settings.about.language}
                            onChange={(event) => updateSection('about', 'language', event.target.value)}
                          >
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                          </select>
                        </div>
                        <div className="settings-group">
                          <label className="label">Time zone</label>
                          <select
                            className="input"
                            value={settings.about.timeZone}
                            onChange={(event) => updateSection('about', 'timeZone', event.target.value)}
                          >
                            <option>UTC</option>
                            <option>GMT+1</option>
                            <option>EST</option>
                            <option>PST</option>
                          </select>
                        </div>
                        <div className="settings-group">
                          <label className="label">Date format</label>
                          <select
                            className="input"
                            value={settings.about.dateFormat}
                            onChange={(event) => updateSection('about', 'dateFormat', event.target.value)}
                          >
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="settings-links-grid">
                          <a className="settings-link" href="#">Privacy policy</a>
                          <a className="settings-link" href="#">Terms of service</a>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
