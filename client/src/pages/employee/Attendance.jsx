import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function EmployeeAttendance() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/attendance').then(r => { setList(r.data); setLoading(false); });
  }, []);
  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">My Attendance</h1>
        <p className="small-text">Review your recent attendance and work hours.</p>
      </div>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-12" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="5" className="table-empty"><div className="table-empty-icon">🗓</div><div className="font-semibold text-primary">No attendance entries</div><p className="mt-2">Your attendance history will appear here once it is available.</p></td></tr>
              ) : list.map(a => (
                <tr key={a._id} className="table-row">
                  <td className="table-cell">{a.date}</td>
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
