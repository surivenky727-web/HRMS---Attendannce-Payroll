import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', employeeId: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await register(form);
      toast.success('Account created successfully');
      nav(u.role === 'admin' ? '/admin' : '/me');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
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
              <div className="auth-hero-pill">Create an account</div>
              <h1 className="display text-white mt-5 mb-3">Launch your HR operations with confidence.</h1>
              <p className="body text-white/85 max-w-md">Join a secure, elegant workspace that keeps attendance, payroll, and leave management in sync.</p>
            </div>
            <div className="auth-brand">
              <div className="auth-brand-badge">A</div>
              <div>
                <div className="font-semibold">Attendance Payroll</div>
                <div className="text-sm text-white/80">Smart HROS platform</div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <form onSubmit={submit}>
            <div className="mb-5">
              <h2 className="heading-2 text-primary mb-1">Create account</h2>
              <p className="body text-secondary">Set up your HRMS profile in a few steps.</p>
            </div>
            <div className="form-grid">
              {['name','employeeId','email','phone','password'].map(k => (
                <div key={k} className={k === 'name' || k === 'email' ? 'md-span-2' : ''}>
                  <label className="label capitalize">{k}<span className="required-mark">*</span></label>
                  {k === 'password' ? (
                    <div className="auth-input-wrap">
                      <input className="input" type={showPassword ? 'text' : 'password'} value={form[k]} onChange={e => set(k, e.target.value)} required />
                      <button type="button" className="auth-toggle" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                  ) : (
                    <input className="input" type={k === 'email' ? 'email' : 'text'} value={form[k]} onChange={e => set(k, e.target.value)} required={k !== 'phone' && k !== 'employeeId'} />
                  )}
                </div>
              ))}
            </div>
            <button className={`btn-primary w-full mt-5 ${loading ? 'btn-loading' : ''}`} disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
            <div className="mt-4 text-center text-sm text-secondary">
              Have an account? <Link className="auth-link" to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
