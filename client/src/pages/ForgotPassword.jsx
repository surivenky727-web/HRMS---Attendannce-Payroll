import { useState } from 'react';
import api from '../api/axios.js';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success('If that email exists, a reset token has been issued.');
      if (data.devResetToken) setToken(data.devResetToken);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Unable to send reset token');
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
              <div className="auth-hero-pill">Password recovery</div>
              <h1 className="display text-white mt-5 mb-3">Securely regain access to your account.</h1>
              <p className="body text-white/85 max-w-md">We’ll guide you with a simple reset flow that keeps your workspace protected.</p>
            </div>
            <div className="auth-brand">
              <div className="auth-brand-badge">A</div>
              <div>
                <div className="font-semibold">Attendance Payroll</div>
                <div className="text-sm text-white/80">Trusted by modern teams</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <form onSubmit={submit}>
            <div className="mb-5">
              <h2 className="heading-2 text-primary mb-1">Forgot password</h2>
              <p className="body text-secondary">Enter your email and we’ll help you reset it.</p>
            </div>
            <div>
              <label className="label">Email<span className="required-mark">*</span></label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className={`btn-primary w-full mt-5 ${loading ? 'btn-loading' : ''}`} disabled={loading}>{loading ? 'Sending...' : 'Send reset token'}</button>
            {token && (
              <div className="auth-message mt-4" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'rgb(245, 158, 11)' }}>
                Dev token: {token} — <Link className="underline font-semibold" to={`/reset-password?token=${token}`}>reset now</Link>
              </div>
            )}
            <div className="mt-4 text-center text-sm text-secondary">
              <Link className="auth-link" to="/login">Back to sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
