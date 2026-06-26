import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminLeaves() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); const { data } = await api.get('/leaves'); setList(data); setLoading(false); }
  useEffect(() => { load(); }, []);
  async function decide(id, status) {
    try {
      await api.put(`/leaves/${id}`, { status });
      load();
      toast.success(`Leave request ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave request');
    }
  }

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">Leave Requests</h1>
        <p className="small-text">Review leave requests and manage decisions quickly.</p>
      </div>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-28" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-36" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell" />
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="7" className="table-empty"><div className="table-empty-icon">🌿</div><div className="font-semibold text-primary">No leave requests</div><p className="mt-2">There are no pending or historical leave requests right now.</p></td></tr>
              ) : list.map(l => (
                <tr key={l._id} className="table-row">
                  <td className="table-cell font-semibold">{l.employee?.name}</td>
                  <td className="table-cell capitalize">{l.leaveType}</td>
                  <td className="table-cell">{l.startDate?.slice(0,10)}</td>
                  <td className="table-cell">{l.endDate?.slice(0,10)}</td>
                  <td className="table-cell">{l.reason}</td>
                  <td className="table-cell"><span className={`status-badge ${l.status==='approved' ? 'status-approved' : l.status==='rejected' ? 'status-rejected' : 'status-pending'}`}>{l.status}</span></td>
                  <td className="table-cell text-right">
                    {l.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button className="table-action-btn table-action-btn-success" title="Approve leave" onClick={() => decide(l._id, 'approved')}>✓</button>
                        <button className="table-action-btn table-action-btn-danger" title="Reject leave" onClick={() => decide(l._id, 'rejected')}>✕</button>
                      </div>
                    ) : <span className="small-text">Handled</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
