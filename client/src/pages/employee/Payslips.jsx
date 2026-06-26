import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function EmployeePayslips() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/payroll').then(r => { setList(r.data); setLoading(false); });
  }, []);

  async function download(id) {
    const res = await api.get(`/payroll/payslip/${id}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = `payslip-${id}.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">My Payslips</h1>
        <p className="small-text">Access your payroll history and download payslips.</p>
      </div>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Period</th><th>Present</th><th>Gross</th><th>Net</th><th></th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell" />
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="5" className="table-empty"><div className="table-empty-icon">🧾</div><div className="font-semibold text-primary">No payslips yet</div><p className="mt-2">Generated payslips will appear here for quick download.</p></td></tr>
              ) : list.map(p => (
                <tr key={p._id} className="table-row">
                  <td className="table-cell">{p.month}/{p.year}</td>
                  <td className="table-cell">{p.presentDays}/{p.workingDays}</td>
                  <td className="table-cell">${p.grossSalary?.toFixed(2)}</td>
                  <td className="table-cell font-semibold">${p.netSalary?.toFixed(2)}</td>
                  <td className="table-cell text-right"><button className="table-action-btn" title="Download payslip" onClick={()=>download(p._id)}>⬇</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
