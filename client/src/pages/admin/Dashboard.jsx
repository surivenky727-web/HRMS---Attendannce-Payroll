import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = [
  'rgb(var(--color-primary-rgb))',
  'rgb(var(--color-success-rgb))',
  'rgb(var(--color-warning-rgb))',
  'rgb(var(--color-danger-rgb))',
  'rgb(var(--color-secondary-rgb))',
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="chart-tooltip-row">
          <span className="chart-tooltip-color" style={{ background: entry.fill }} />
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function formatRelativeDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const diffDays = Math.round((Date.now() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function rangeBounds(rangeKey) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let rangeStart = new Date(start);

  if (rangeKey === 'week') {
    rangeStart.setDate(start.getDate() - start.getDay());
  } else if (rangeKey === 'month') {
    rangeStart = new Date(start.getFullYear(), start.getMonth(), 1);
  } else if (rangeKey === 'year') {
    rangeStart = new Date(start.getFullYear(), 0, 1);
  }

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start: rangeStart, end };
}

const actionItems = [
  { label: 'Add employee', icon: '👤' },
  { label: 'Approve leave', icon: '✅' },
  { label: 'Generate report', icon: '📄' },
  { label: 'Run payroll', icon: '💰' },
];

export default function AdminDashboard() {
  const toast = useToast();
  const [data, setData] = useState({ employees: [], attendance: [], leaves: [], payroll: [], depts: [] });
  const [selectedRange, setSelectedRange] = useState('month');

  useEffect(() => {
    (async () => {
      const [e, a, l, p, d] = await Promise.all([
        api.get('/employees'), api.get('/attendance'), api.get('/leaves'),
        api.get('/payroll'), api.get('/departments'),
      ]);
      setData({ employees: e.data, attendance: a.data, leaves: l.data, payroll: p.data, depts: d.data });
    })().catch(() => {
      toast.error('Unable to load dashboard data');
    });
  }, [toast]);

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total employees', data.employees.length],
      ['Attendance records', data.attendance.length],
      ['Leave requests', data.leaves.length],
      ['Payroll records', data.payroll.length],
      ['Departments', data.depts.length],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'dashboard-analytics.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('CSV export started');
  };

  const exportPdf = () => {
    toast.warning('Export to PDF is not available in this release.');
  };

  const today = new Date().toISOString().slice(0, 10);
  const todays = data.attendance.filter((item) => item.date === today);
  const present = todays.filter((item) => item.status === 'present' || item.status === 'half-day').length;
  const onLeave = data.leaves.filter((item) => item.status === 'approved').length;
  const totalPayroll = data.payroll.reduce((sum, payroll) => sum + (payroll.netSalary || 0), 0);
  const totalEmployees = data.employees.length;

  const attendanceThisMonth = useMemo(() => {
    const now = new Date();
    return data.attendance.filter((item) => {
      const date = new Date(`${item.date}T00:00:00`);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
  }, [data.attendance]);

  const presentThisMonth = attendanceThisMonth.filter((item) => item.status === 'present' || item.status === 'half-day').length;
  const monthlyAttendancePct = attendanceThisMonth.length ? Math.round((presentThisMonth / attendanceThisMonth.length) * 100) : 0;

  const deptPie = data.depts.map((dept) => ({ name: dept.name, value: dept.employeeCount || 0 }));
  const deptCount = data.depts.length;
  const leaveRequests = data.leaves.length;
  const payrollProcessed = data.payroll.length;

  const rangeBoundsMemo = useMemo(() => rangeBounds(selectedRange), [selectedRange]);

  const attendanceByRange = useMemo(
    () => data.attendance.filter((item) => {
      const date = new Date(`${item.date}T00:00:00`);
      return date >= rangeBoundsMemo.start && date <= rangeBoundsMemo.end;
    }),
    [data.attendance, rangeBoundsMemo]
  );

  const attendanceByDate = useMemo(() => {
    const map = {};
    attendanceByRange.forEach((item) => {
      map[item.date] = (map[item.date] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ month: date.slice(5), count }));
  }, [attendanceByRange]);

  const recentActivity = useMemo(() => {
    return [...data.attendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [data.attendance]);

  const kpis = [
    {
      title: 'Employees',
      value: totalEmployees,
      subtitle: 'Total team members',
      icon: '👥',
      iconBg: 'rgba(79,70,229,0.12)',
      trend: '—',
      trendLabel: '0.0%',
    },
    {
      title: 'Present today',
      value: present,
      subtitle: 'Checked in now',
      icon: '✅',
      iconBg: 'rgba(16,185,129,0.14)',
      trend: '↑',
      trendLabel: '4.7%',
    },
    {
      title: 'Absent today',
      value: Math.max(0, totalEmployees - present),
      subtitle: 'Missing attendance',
      icon: '⚠️',
      iconBg: 'rgba(239,68,68,0.14)',
      trend: '↓',
      trendLabel: '1.2%',
    },
    {
      title: 'On leave',
      value: onLeave,
      subtitle: 'Approved requests',
      icon: '🕑',
      iconBg: 'rgba(245,158,11,0.14)',
      trend: '↑',
      trendLabel: '2.3%',
    },
    {
      title: 'Payroll total',
      value: `$${totalPayroll.toFixed(0)}`,
      subtitle: 'Net payout',
      icon: '💵',
      iconBg: 'rgba(6,182,212,0.14)',
      trend: '↑',
      trendLabel: '3.8%',
    },
  ];

  const analyticsCards = [
    {
      title: 'Attendance rate',
      value: `${monthlyAttendancePct}%`,
      detail: `${presentThisMonth} present from ${attendanceThisMonth.length || 0} records`,
      icon: '📈',
    },
    {
      title: 'Total employees',
      value: totalEmployees,
      detail: `${deptCount} departments`,
      icon: '👥',
    },
    {
      title: 'Leave requests',
      value: leaveRequests,
      detail: `${onLeave} approved`,
      icon: '🧾',
    },
    {
      title: 'Payroll processed',
      value: payrollProcessed,
      detail: `$${Math.round(totalPayroll / 1000)}k net`,
      icon: '💰',
    },
  ];

  return (
    <div className="space-y-6 animate-page">
      <div className="dashboard-header">
        <div>
          <h1 className="heading-1 text-primary">Dashboard</h1>
          <p className="small-text text-secondary">Enterprise analytics with modern charts, filters, and export tools.</p>
        </div>
      </div>

      <div className="filter-actions">
        <div className="filter-tabs">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              type="button"
              className={`filter-tab${selectedRange === range ? ' active' : ''}`}
              onClick={() => setSelectedRange(range)}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
        <div className="export-actions">
          <button type="button" className="export-btn btn-secondary" onClick={exportCsv}>Export CSV</button>
          <button type="button" className="export-btn btn-secondary" onClick={exportPdf}>Export PDF</button>
        </div>
      </div>

      <div className="analytics-grid">
        {analyticsCards.map((item) => (
          <div key={item.title} className="analytics-card fade-slide-in">
            <div className="analytics-top">
              <div>
                <p className="caption text-secondary">{item.title}</p>
              </div>
              <span className="analytics-icon">{item.icon}</span>
            </div>
            <p className="analytics-value">{item.value}</p>
            <p className="analytics-caption text-secondary">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="dashboard-card chart-card fade-slide-in">
          <div className="chart-panel-header">
            <div>
              <h2 className="heading-3">Attendance trend</h2>
              <p className="small-text text-secondary">Filtered by selected period.</p>
            </div>
          </div>
          {attendanceByDate.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceByDate} margin={{ top: 24, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(79,70,229,0.9)" />
                      <stop offset="100%" stopColor="rgba(79,70,229,0.16)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="url(#attendanceGradient)" radius={[16, 16, 0, 0]} animationDuration={300} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <div>
                <p className="font-semibold">No attendance data available for this range.</p>
                <p className="small-text text-secondary">Select a different period or add attendance records to populate this chart.</p>
              </div>
            </div>
          )}
        </section>

        <section className="dashboard-card chart-card fade-slide-in">
          <div className="chart-panel-header">
            <div>
              <h2 className="heading-3">Department distribution</h2>
              <p className="small-text text-secondary">Current headcount split.</p>
            </div>
          </div>
          {deptPie.some((item) => item.value > 0) ? (
            <div className="chart-wrapper pie-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={deptPie} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6} animationDuration={300}>
                    {deptPie.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-empty">
              <div>
                <p className="font-semibold">No department headcount data yet.</p>
                <p className="small-text text-secondary">Add departments and assign employees to enable this chart.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="dashboard-card timeline-card fade-slide-in">
          <div className="section-header">
            <div>
              <h2 className="heading-3">Recent activity</h2>
              <p className="small-text text-secondary">Latest attendance events</p>
            </div>
          </div>
          <div className="timeline-list">
            {recentActivity.map((item) => {
              const icon = item.status === 'present' ? '✅' : item.status === 'approved' ? '🕑' : '⛔';
              const statusLabel = item.status === 'present' ? 'Checked in' : item.status === 'half-day' ? 'Half day' : item.status;
              return (
                <div key={`${item._id}-${item.date}`} className="timeline-item">
                  <div className="timeline-marker">
                    <span className={`timeline-icon ${item.status === 'present' ? 'status-present' : item.status === 'approved' ? 'status-leave' : 'status-absent'}`}>{icon}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="font-semibold">{item.employee?.name || 'Employee'} {statusLabel}</span>
                      <span className="timeline-time">{formatRelativeDate(item.date)}</span>
                    </div>
                    <p className="text-sm text-secondary">{item.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="dashboard-card actions-card fade-slide-in">
          <div className="section-header">
            <div>
              <h2 className="heading-3">Quick actions</h2>
              <p className="small-text text-secondary">Speed up common tasks</p>
            </div>
          </div>
          <div className="actions-grid">
            {actionItems.map((action) => (
              <button key={action.label} type="button" className="action-card">
                <span className="action-icon">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
