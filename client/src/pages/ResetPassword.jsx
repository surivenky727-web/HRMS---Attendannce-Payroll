import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password reset. Redirecting to login...');
      setTimeout(() => nav('/login'), 1500);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell animate-page">
      <div className="auth-split">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div>
              <div className="auth-hero-pill">Password reset</div>
              <h1 className="display text-white mt-5 mb-3">Choose a fresh password for a safer sign-in.</h1>
              <p className="body text-white/85 max-w-md">Complete the reset flow with a polished experience built for focus and clarity.</p>
            </div>
            <div className="auth-brand">
              <div className="auth-brand-badge">A</div>
              <div>
                <div className="font-semibold">Attendance Payroll</div>
                <div className="text-sm text-white/80">Premium HR processes</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <form onSubmit={submit}>
            <div className="mb-5">
              <h2 className="heading-2 text-primary mb-1">Reset password</h2>
              <p className="body text-secondary">Choose a secure password to finish the reset.</p>
            </div>
            <div className="form-section">
              <div>
                <label className="label">Token<span className="required-mark">*</span></label>
                <input className="input" value={token} onChange={e => setToken(e.target.value)} required />
              </div>
              <div>
                <label className="label">New password<span className="required-mark">*</span></label>
                <div className="auth-input-wrap">
                  <input type={showPassword ? 'text' : 'password'} className="input" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="auth-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            </div>
            <button className={`btn-primary w-full mt-5 ${loading ? 'btn-loading' : ''}`} disabled={loading}>{loading ? 'Resetting...' : 'Reset'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
