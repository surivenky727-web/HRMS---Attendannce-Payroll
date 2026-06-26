import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

const empty = { employeeId: '', name: '', email: '', phone: '', designation: '', salary: 0, department: '', status: 'active' };

export default function Employees() {
  const [list, setList] = useState([]);
  const [depts, setDepts] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function load() {
    setLoading(true);
    const { data } = await api.get('/employees', { params: q ? { q } : {} });
    setList(data);
    const d = await api.get('/departments'); setDepts(d.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, [q]);

  const toast = useToast();

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, salary: Number(form.salary) };
    try {
      if (editing) await api.put(`/employees/${editing}`, payload);
      else await api.post('/employees', payload);
      setForm(empty);
      setEditing(null);
      load();
      toast.success(editing ? 'Employee updated successfully' : 'Employee added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    }
  }

  function edit(emp) { setEditing(emp._id); setForm({ ...emp, department: emp.department?._id || '' }); }

  async function del(id) {
    if (await toast.confirm('Delete employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        load();
        toast.success('Employee deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  }

  function exportCsv() {
    const rows = [['ID','Name','Email','Phone','Department','Designation','Salary','Status']];
    list.forEach(e => rows.push([e.employeeId, e.name, e.email, e.phone || '', e.department?.name || '', e.designation || '', e.salary, e.status]));
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-page">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-1 mb-1">Employees</h1>
          <p className="small-text">Manage employee records, departments, and statuses from one place.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="input w-full sm:w-64" placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn-ghost" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>

      <form onSubmit={save} className="card form-card">
        <div className="form-grid">
          <div>
            <label className="label">Employee ID<span className="required-mark">*</span></label>
            <input className="input" placeholder="EMP-001" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)} required />
          </div>
          <div>
            <label className="label">Name<span className="required-mark">*</span></label>
            <input className="input" placeholder="Full name" value={form.name} onChange={e=>set('name',e.target.value)} required />
          </div>
          <div>
            <label className="label">Email<span className="required-mark">*</span></label>
            <input className="input" placeholder="name@company.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="Phone number" value={form.phone} onChange={e=>set('phone',e.target.value)} />
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input" placeholder="Role or title" value={form.designation} onChange={e=>set('designation',e.target.value)} />
          </div>
          <div>
            <label className="label">Salary</label>
            <input className="input" type="number" placeholder="Annual salary" value={form.salary} onChange={e=>set('salary',e.target.value)} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={e=>set('department',e.target.value)}>
              <option value="">Select department</option>
              {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-primary">{editing ? 'Update' : 'Add employee'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head">
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Salary</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-28" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-36" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-20" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-16" /></td>
                  <td className="table-cell" />
                </tr>
              )) : list.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <div className="table-empty-icon">👤</div>
                    <div className="font-semibold text-primary">No employees found</div>
                    <p className="mt-2">Try a different search or add a new employee to get started.</p>
                  </td>
                </tr>
              ) : list.map(e => (
                <tr key={e._id} className="table-row">
                  <td className="table-cell">{e.employeeId}</td>
                  <td className="table-cell font-semibold">{e.name}</td>
                  <td className="table-cell">{e.email}</td>
                  <td className="table-cell">{e.department?.name || '-'}</td>
                  <td className="table-cell">${e.salary}</td>
                  <td className="table-cell"><span className={`status-badge ${e.status === 'active' ? 'status-active' : 'status-inactive'}`}>{e.status}</span></td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button className="table-action-btn" title="Edit employee" onClick={() => edit(e)}>✎</button>
                      <button className="table-action-btn table-action-btn-danger" title="Delete employee" onClick={() => del(e._id)}>🗑</button>
                    </div>
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
