import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function AdminAttendance() {
  const [list, setList] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get('/attendance', { params: { from: from || undefined, to: to || undefined } });
    setList(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, [from, to]);

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">Attendance</h1>
        <p className="small-text">Track daily check-ins, working hours, and attendance status.</p>
      </div>
      <div className="card flex flex-wrap gap-3 items-end p-4 md:p-5">
        <div><label className="label">From</label><input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)} /></div>
        <div><label className="label">To</label><input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)} /></div>
        <button className="btn-ghost" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
      </div>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Date</th><th>Employee</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-28" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-12" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="6" className="table-empty"><div className="table-empty-icon">📅</div><div className="font-semibold text-primary">No attendance records</div><p className="mt-2">No data matches the selected date range yet.</p></td></tr>
              ) : list.map(a => (
                <tr key={a._id} className="table-row">
                  <td className="table-cell">{a.date}</td>
                  <td className="table-cell font-semibold">{a.employee?.name}</td>
                  <td className="table-cell">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '-'}</td>
                  <td className="table-cell">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '-'}</td>
                  <td className="table-cell">{a.workingHours || 0}</td>
                  <td className="table-cell"><span className={`status-badge ${a.status === 'present' ? 'status-present' : a.status === 'absent' ? 'status-absent' : 'status-unknown'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
