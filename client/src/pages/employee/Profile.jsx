import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const STORAGE_KEY = 'hrms-profile-settings';
const formatDate = (value) => new Date(value).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

export default function Profile() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [profile, setProfile] = useState({
    fullName: user?.name || '',
    employeeId: user?.employeeId || 'EMP-0194',
    role: user?.role || 'Employee',
    department: user?.department || 'Human Resources',
    email: user?.email || '',
    phone: user?.phone || '+1 (555) 012-3456',
    joinDate: user?.joinDate || '2023-01-18',
    status: user?.status || 'Active',
    language: 'English',
    timeZone: 'UTC',
    accountTheme: theme,
    avatarUrl: '',
  });
  const [savedProfile, setSavedProfile] = useState(profile);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, avatarUrl: reader.result }));
      input.value = '';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile((prev) => ({ ...prev, ...parsed }));
      setSavedProfile((prev) => ({ ...prev, ...parsed }));
      if (parsed.accountTheme) setTheme(parsed.accountTheme);
    }
  }, [setTheme]);

  const hasChanges = useMemo(() => JSON.stringify(profile) !== JSON.stringify(savedProfile), [profile, savedProfile]);

  const completion = useMemo(() => {
    const fields = [profile.fullName, profile.email, profile.phone, profile.department, profile.language, profile.timeZone];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const validate = () => {
    const next = {};
    if (!profile.fullName.trim()) next.fullName = 'Full name is required.';
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) next.email = 'A valid email is required.';
    if (!profile.phone.trim() || !/^\+?[0-9 ()-]{7,20}$/.test(profile.phone)) next.phone = 'A valid phone number is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validate()) {
      toast.error('Please fix validation errors before saving.');
      return;
    }
    const next = { ...profile };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedProfile(next);
    setTheme(next.accountTheme);
    toast.success('Profile updates saved successfully');
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setErrors({});
    toast.info('Changes canceled');
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Please make sure new passwords match.');
      return;
    }
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="profile-shell animate-page space-y-6">
      <header className="profile-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-2 mb-1">Profile & Account</h1>
          <p className="body text-secondary">Manage your profile, security settings, and account preferences.</p>
          <div className="mt-4">
            <div className="profile-progress-bar">
              <div className="profile-progress-fill" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-sm text-secondary mt-2">{completion}% complete — keep your details current for better account support.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasChanges && <span className="settings-chip">Unsaved changes</span>}
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel changes</button>
          <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>Save changes</button>
        </div>
      </header>

      <div className="profile-grid">
        <section className="profile-overview card p-6">
          <div className="profile-overview-top flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="profile-avatar-group flex items-center gap-4">
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Profile avatar" />
                ) : (
                  profile.fullName?.split(' ').map((word) => word[0]).join('').slice(0, 2)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{profile.fullName}</h2>
                <p className="text-sm text-secondary">{profile.role} • {profile.department}</p>
              </div>
            </div>
            <div>
              <button type="button" className="btn btn-ghost" onClick={openFilePicker}>Change picture</button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>

          <div className="profile-details-grid mt-6 gap-4 grid">
            {[
              { label: 'Employee ID', value: profile.employeeId },
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone },
              { label: 'Join date', value: formatDate(profile.joinDate) },
              { label: 'Department', value: profile.department },
              { label: 'Status', value: profile.status, badge: true },
            ].map((item) => (
              <div key={item.label} className="profile-detail-row">
                <span className="text-sm text-secondary">{item.label}</span>
                {item.badge ? (
                  <span className={`status-badge ${profile.status.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>{item.value}</span>
                ) : (
                  <p className="font-medium">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="profile-right-grid grid gap-6">
          <section className="profile-card card p-6">
            <div className="section-header">
              <div>
                <h2 className="text-xl font-semibold">Personal information</h2>
                <p className="text-sm text-secondary">Update your profile details.</p>
              </div>
            </div>
            <div className="form-grid mt-5">
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  value={profile.fullName}
                  onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
                />
                {errors.fullName && <p className="field-feedback error">{errors.fullName}</p>}
              </div>
              <div>
                <label className="label">Employee ID</label>
                <input className="input" value={profile.employeeId} disabled />
              </div>
              <div>
                <label className="label">Department</label>
                <input
                  className="input"
                  value={profile.department}
                  onChange={(event) => setProfile((prev) => ({ ...prev, department: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  value={profile.email}
                  onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                />
                {errors.email && <p className="field-feedback error">{errors.email}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={profile.phone}
                  onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                />
                {errors.phone && <p className="field-feedback error">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Role</label>
                <input className="input" value={profile.role} disabled />
              </div>
            </div>
          </section>

          <section className="profile-card card p-6">
            <div className="section-header">
              <div>
                <h2 className="text-xl font-semibold">Security</h2>
                <p className="text-sm text-secondary">Change your password and manage access.</p>
              </div>
            </div>
            <form className="form-grid mt-5" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="label">Current password</label>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="settings-switch-row col-span-full justify-between">
                <div>
                  <p className="font-semibold">Show password</p>
                  <p className="text-sm text-secondary">Toggle visibility for password inputs.</p>
                </div>
                <label className="settings-switch">
                  <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
                  <span className="settings-switch-track" />
                </label>
              </div>
              <div className="password-strength col-span-full">
                <div className="password-strength-bar">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <span
                      key={index}
                      className={`password-strength-segment ${passwordStrength(newPassword) > index ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-secondary">Password strength: {['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][passwordStrength(newPassword)]}</p>
              </div>
              <div className="col-span-full flex flex-wrap gap-3 justify-end">
                <button type="submit" className="btn btn-primary">Update password</button>
              </div>
            </form>
            <div className="settings-placeholder-card mt-5">
              <div>
                <h3 className="font-semibold">Two-factor authentication</h3>
                <p className="text-sm text-secondary">Placeholder UI for 2FA setup and status.</p>
              </div>
              <span className="settings-badge">Coming soon</span>
            </div>
            <div className="settings-placeholder-card">
              <div>
                <h3 className="font-semibold">Active sessions</h3>
                <p className="text-sm text-secondary">Monitor sign-ins and device access.</p>
              </div>
              <span className="settings-badge">1 active</span>
            </div>
          </section>

          <section className="profile-card card p-6">
            <div className="section-header">
              <div>
                <h2 className="text-xl font-semibold">Account preferences</h2>
                <p className="text-sm text-secondary">Theme and localization preferences.</p>
              </div>
            </div>
            <div className="form-grid mt-5">
              <div>
                <label className="label">Theme</label>
                <select
                  className="input"
                  value={profile.accountTheme}
                  onChange={(event) => {
                    setProfile((prev) => ({ ...prev, accountTheme: event.target.value }));
                    setTheme(event.target.value);
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select
                  className="input"
                  value={profile.language}
                  onChange={(event) => setProfile((prev) => ({ ...prev, language: event.target.value }))}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>
              <div>
                <label className="label">Time zone</label>
                <select
                  className="input"
                  value={profile.timeZone}
                  onChange={(event) => setProfile((prev) => ({ ...prev, timeZone: event.target.value }))}
                >
                  <option>UTC</option>
                  <option>GMT+1</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
            </div>
          </section>

          <section className="profile-card card p-6">
            <div className="section-header">
              <div>
                <h2 className="text-xl font-semibold">Activity summary</h2>
                <p className="text-sm text-secondary">Quick metrics for your performance and access.</p>
              </div>
            </div>
            <div className="activity-grid mt-5">
              {[
                { label: 'Attendance rate', value: '98%', accent: 'success' },
                { label: 'Leave balance', value: '12 days', accent: 'warning' },
                { label: 'Payroll status', value: 'Paid', accent: 'primary' },
                { label: 'Last login', value: '2 hours ago', accent: 'secondary' },
              ].map((item) => (
                <div key={item.label} className="activity-card">
                  <span className="text-sm text-secondary">{item.label}</span>
                  <p className="text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-card card p-6">
            <div className="section-header">
              <div>
                <h2 className="text-xl font-semibold">Profile completion</h2>
                <p className="text-sm text-secondary">Keep your profile up to date for a stronger account.</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-3 text-sm text-secondary">{completion}% completed</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
