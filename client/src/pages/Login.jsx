import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, password);
      toast.success('Signed in successfully');
      nav(u.role === 'admin' ? '/admin' : '/me');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
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
              <div className="auth-hero-pill">HR Management Platform</div>
              <h1 className="display text-white mt-5 mb-3">Welcome back to your team workspace.</h1>
              <p className="body text-white/85 max-w-md">Streamline attendance, payroll, leaves, and people operations from a single premium dashboard.</p>
            </div>
            <div className="auth-brand">
              <div className="auth-brand-badge">A</div>
              <div>
                <div className="font-semibold">Attendance Payroll</div>
                <div className="text-sm text-white/80">Modern workforce control</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <form onSubmit={submit}>
            <div className="mb-6">
              <h2 className="heading-2 text-primary mb-1">Sign in</h2>
              <p className="body text-secondary">Use your HRMS credentials to continue.</p>
            </div>
            <div className="form-section">
              <div>
                <label className="label">Email<span className="required-mark">*</span></label>
                <input className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password<span className="required-mark">*</span></label>
                <div className="auth-input-wrap">
                  <input type={showPassword ? 'text' : 'password'} className="input" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="auth-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <label className="auth-remember">
                <input type="checkbox" checked={remember} onChange={() => setRemember(v => !v)} />
                Remember me
              </label>
              <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
            </div>
            <button className={`btn-primary w-full mt-5 ${loading ? 'btn-loading' : ''}`} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <div className="mt-5 text-center text-sm text-secondary">
              New here? <Link className="auth-link" to="/register">Create account</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
