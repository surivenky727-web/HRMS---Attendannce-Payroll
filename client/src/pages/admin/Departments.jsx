import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function Departments() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', head: '' });
  const [editing, setEditing] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function load() { setLoading(true); const { data } = await api.get('/departments'); setList(data); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/departments/${editing}`, form);
      else await api.post('/departments', form);
      setForm({ name:'', head:'' });
      setEditing(null);
      load();
      toast.success(editing ? 'Department updated' : 'Department created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    }
  }

  async function del(id) {
    if (await toast.confirm('Delete department?')) {
      try {
        await api.delete(`/departments/${id}`);
        load();
        toast.success('Department deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete department');
      }
    }
  }

  return (
    <div className="space-y-6 animate-page">
      <div>
        <h1 className="heading-1 mb-1">Departments</h1>
        <p className="small-text">Organize teams and keep department heads visible.</p>
      </div>
      <form onSubmit={save} className="card form-card">
        <div className="form-grid">
          <div>
            <label className="label">Department name<span className="required-mark">*</span></label>
            <input className="input" placeholder="e.g. Engineering" value={form.name} onChange={e=>set('name',e.target.value)} required />
          </div>
          <div>
            <label className="label">Head</label>
            <input className="input" placeholder="Department lead" value={form.head} onChange={e=>set('head',e.target.value)} />
          </div>
        </div>
        <div className="mt-5"><button className="btn-primary">{editing ? 'Update' : 'Add'}</button></div>
      </form>
      <div className="card table-card">
        <div className="table-scroll">
          <table className="table-shell">
            <thead className="table-head"><tr><th>Name</th><th>Head</th><th>Employees</th><th></th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-24" /></td>
                  <td className="table-cell"><div className="table-skeleton-bar w-12" /></td>
                  <td className="table-cell" />
                </tr>
              )) : list.length === 0 ? (
                <tr><td colSpan="4" className="table-empty"><div className="table-empty-icon">🏢</div><div className="font-semibold text-primary">No departments yet</div><p className="mt-2">Create one to start grouping your employees.</p></td></tr>
              ) : list.map(d => (
                <tr key={d._id} className="table-row">
                  <td className="table-cell font-semibold">{d.name}</td>
                  <td className="table-cell">{d.head || '-'}</td>
                  <td className="table-cell">{d.employeeCount}</td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <button className="table-action-btn" title="Edit department" onClick={() => { setEditing(d._id); setForm({ name: d.name, head: d.head || '' }); }}>✎</button>
                      <button className="table-action-btn table-action-btn-danger" title="Delete department" onClick={() => del(d._id)}>🗑</button>
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
