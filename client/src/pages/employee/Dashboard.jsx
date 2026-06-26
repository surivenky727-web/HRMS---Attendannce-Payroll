import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import StatCard from '../../components/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function EmployeeDashboard() {
  const toast = useToast();
  const [att, setAtt] = useState([]);
  const [pay, setPay] = useState([]);
  const [leaves, setLeaves] = useState([]);

  async function load() {
    const [a, p, l] = await Promise.all([api.get('/attendance'), api.get('/payroll'), api.get('/leaves')]);
    setAtt(a.data); setPay(p.data); setLeaves(l.data);
  }
  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0,10);
  const todayRec = att.find(a => a.date === today);
  const monthRecs = att.filter(a => a.date.startsWith(today.slice(0,7)));
  const latest = pay[0];

  async function checkIn() {
    try {
      await api.post('/attendance/checkin');
      load();
      toast.success('Checked in successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed');
    }
  }

  async function checkOut() {
    try {
      await api.post('/attendance/checkout');
      load();
      toast.success('Checked out successfully');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-out failed');
    }
  }

  return (
    <div className="space-y-6 animate-page">
      <h1 className="heading-1">My Dashboard</h1>
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="caption text-secondary">Today's status</div>
          <div className="text-lg font-semibold">
            {todayRec ? (todayRec.checkOut ? `Checked out — ${todayRec.workingHours}h` : `Checked in at ${new Date(todayRec.checkIn).toLocaleTimeString()}`) : 'Not checked in'}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={checkIn} disabled={!!todayRec?.checkIn}>Check in</button>
          <button className="btn-ghost" onClick={checkOut} disabled={!todayRec?.checkIn || !!todayRec?.checkOut}>Check out</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="This month" value={`${monthRecs.length} days`} />
        <StatCard label="Approved leaves" value={leaves.filter(l => l.status==='approved').length} accent="bg-success-50 text-success" />
        <StatCard label="Latest net pay" value={latest ? `$${latest.netSalary.toFixed(2)}` : '—'} accent="bg-secondary-50 text-secondary" />
      </div>
    </div>
  );
}
