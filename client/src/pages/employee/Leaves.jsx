import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function EmployeeLeaves() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function load() { setLoading(true); const { data } = await api.get('/leaves'); setList(data); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    await api.post('/leaves', form);
    setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
    load();
  }

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">My Leaves</h1>
        <p className="small-text">Submit leave requests and monitor their current status.</p>
      </div>
      <form onSubmit={submit} className="card form-card">
        <div className="form-grid">
          <div>
            <label className="label">Leave type<span className="required-mark">*</span></label>
            <select className="input" value={form.leaveType} onChange={e=>set('leaveType',e.target.value)}>
              <option value="casual">Casual</option><option value="sick">Sick</option>
              <option value="earned">Earned</option><option value="wfh">Work From Home</option>
            </select>
          </div>
          <div>
            <label className="label">Start date<span className="required-mark">*</span></label>
            <input className="input" type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} required />
          </div>
          <div>
            <label className="label">End date<span className="required-mark">*</span></label>
            <input className="input" type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} required />
          </div>
          <div className="md-span-2">
            <label className="label">Reason</label>
            <input className="input" placeholder="Brief explanation" value={form.reason} onChange={e=>set('reason',e.target.value)} />
          </div>
        </div>
        <div className="mt-5"><button className="btn-primary">Apply leave</button></div>
      </form>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-36" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="5" className="table-empty"><div className="table-empty-icon">🌤</div><div className="font-semibold text-primary">No leave requests yet</div><p className="mt-2">Your leave history will appear here after you submit a request.</p></td></tr>
              ) : list.map(l => (
                <tr key={l._id} className="table-row">
                  <td className="table-cell capitalize">{l.leaveType}</td>
                  <td className="table-cell">{l.startDate?.slice(0,10)}</td>
                  <td className="table-cell">{l.endDate?.slice(0,10)}</td>
                  <td className="table-cell">{l.reason}</td>
                  <td className="table-cell"><span className={`status-badge ${l.status==='approved' ? 'status-approved' : l.status==='rejected' ? 'status-rejected' : 'status-pending'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
