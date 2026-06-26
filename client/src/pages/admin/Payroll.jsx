import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const now = new Date();

export default function AdminPayroll() {
  const [emps, setEmps] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    employeeId: '', month: now.getMonth() + 1, year: now.getFullYear(),
    workingDays: 22, overtimeHours: 0, bonus: 0, deductions: 0, tax: 0,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function load() {
    setLoading(true);
    const [e, p] = await Promise.all([api.get('/employees'), api.get('/payroll')]);
    setEmps(e.data); setList(p.data);
    if (e.data[0] && !form.employeeId) set('employeeId', e.data[0]._id);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const toast = useToast();

  async function generate(e) {
    e.preventDefault();
    try {
      await api.post('/payroll/generate', {
        ...form,
        month: Number(form.month), year: Number(form.year),
        workingDays: Number(form.workingDays), overtimeHours: Number(form.overtimeHours),
        bonus: Number(form.bonus), deductions: Number(form.deductions), tax: Number(form.tax),
      });
      load();
      toast.success('Payroll generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll');
    }
  }

  async function download(id) {
    try {
      const res = await api.get(`/payroll/payslip/${id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url; a.download = `payslip-${id}.pdf`; a.click(); URL.revokeObjectURL(url);
      toast.success('Payslip download started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download payslip');
    }
  }

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">Payroll</h1>
        <p className="small-text">Generate payroll and download payslips with a cleaner overview.</p>
      </div>
      <form onSubmit={generate} className="card form-card">
        <div className="form-grid">
          <div>
            <label className="label">Employee<span className="required-mark">*</span></label>
            <select className="input" value={form.employeeId} onChange={e=>set('employeeId', e.target.value)}>
              {emps.map(e => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Month<span className="required-mark">*</span></label>
            <input className="input" type="number" placeholder="1-12" min={1} max={12} value={form.month} onChange={e=>set('month',e.target.value)} />
          </div>
          <div>
            <label className="label">Year<span className="required-mark">*</span></label>
            <input className="input" type="number" placeholder="2026" value={form.year} onChange={e=>set('year',e.target.value)} />
          </div>
          <div>
            <label className="label">Working days</label>
            <input className="input" type="number" placeholder="22" value={form.workingDays} onChange={e=>set('workingDays',e.target.value)} />
          </div>
          <div>
            <label className="label">Overtime hours</label>
            <input className="input" type="number" placeholder="0" value={form.overtimeHours} onChange={e=>set('overtimeHours',e.target.value)} />
          </div>
          <div>
            <label className="label">Bonus</label>
            <input className="input" type="number" placeholder="0" value={form.bonus} onChange={e=>set('bonus',e.target.value)} />
          </div>
          <div>
            <label className="label">Deductions</label>
            <input className="input" type="number" placeholder="0" value={form.deductions} onChange={e=>set('deductions',e.target.value)} />
          </div>
          <div>
            <label className="label">Tax</label>
            <input className="input" type="number" placeholder="0" value={form.tax} onChange={e=>set('tax',e.target.value)} />
          </div>
        </div>
        <div className="mt-5"><button className="btn-primary">Generate payroll</button></div>
      </form>

      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Employee</th><th>Period</th><th>Present</th><th>Gross</th><th>Net</th><th></th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-28" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell" />
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="6" className="table-empty"><div className="table-empty-icon">💳</div><div className="font-semibold text-primary">No payroll records</div><p className="mt-2">Generate a payslip to populate this table.</p></td></tr>
              ) : list.map(p => (
                <tr key={p._id} className="table-row">
                  <td className="table-cell font-semibold">{p.employee?.name}</td>
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
