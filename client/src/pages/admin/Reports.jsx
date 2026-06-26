import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios.js';
import ReportCard from '../../components/ReportCard.jsx';
import ActivityTimeline from '../../components/ActivityTimeline.jsx';

const REPORT_CARDS = [
  {
    id: 'employee',
    title: 'Employee report',
    description: 'Analyze employee headcount, status, and department coverage across the organization.',
    category: 'People',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    exportLabel: 'Employee list',
  },
  {
    id: 'attendance',
    title: 'Attendance report',
    description: 'Track attendance patterns, presence trends, and team punctuality in one view.',
    category: 'Workflow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    exportLabel: 'Attendance summary',
  },
  {
    id: 'payroll',
    title: 'Payroll report',
    description: 'Review compensation runs, salary totals, and payroll status by period.',
    category: 'Finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9h8" />
        <path d="M8 13h6" />
      </svg>
    ),
    exportLabel: 'Payroll details',
  },
  {
    id: 'leave',
    title: 'Leave report',
    description: 'Monitor leave requests, approval status, and open leave balances.',
    category: 'Workflows',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2" />
        <path d="M5 8v13h14V8" />
        <path d="M7 12h10" />
      </svg>
    ),
    exportLabel: 'Leave register',
  },
  {
    id: 'department',
    title: 'Department report',
    description: 'View department performance, headcount allocation, and organizational structure.',
    category: 'People',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M12 7h.01" />
      </svg>
    ),
    exportLabel: 'Department overview',
  },
];

const activityFeed = [
  { id: '1', type: 'employee_created', title: 'New employee added', description: 'A new employee record was created in the HR system.', user: 'Sara Lee', category: 'Employee', department: 'Human Resources', status: 'active', timestamp: '2026-06-26T09:35:00', timeAgo: '5 minutes ago' },
  { id: '2', type: 'attendance_marked', title: 'Attendance marked', description: 'Attendance was updated for the morning shift.', user: 'HR Bot', category: 'Attendance', department: 'Operations', status: 'active', timestamp: '2026-06-26T08:58:00', timeAgo: '42 minutes ago' },
  { id: '3', type: 'leave_requested', title: 'Leave requested', description: 'Annual leave requested by the employee.', user: 'Jordan Smith', category: 'Leave', department: 'Finance', status: 'pending', timestamp: '2026-06-25T16:20:00', timeAgo: '17 hours ago' },
  { id: '4', type: 'leave_approved', title: 'Leave approved', description: 'Leave request approved by the department head.', user: 'Mia Torres', category: 'Leave', department: 'Human Resources', status: 'approved', timestamp: '2026-06-25T14:05:00', timeAgo: '19 hours ago' },
  { id: '5', type: 'payroll_generated', title: 'Payroll generated', description: 'Monthly payroll run completed for June.', user: 'Finance Team', category: 'Payroll', department: 'Finance', status: 'active', timestamp: '2026-06-24T18:00:00', timeAgo: '1 day ago' },
  { id: '6', type: 'department_created', title: 'New department created', description: 'A new marketing department was added to the org chart.', user: 'Admin', category: 'Department', department: 'Marketing', status: 'active', timestamp: '2026-06-24T12:10:00', timeAgo: '1 day ago' },
  { id: '7', type: 'user_logged_in', title: 'User signed in', description: 'A user logged into the HRMS portal.', user: 'Ethan Brooks', category: 'Authentication', department: 'IT', status: 'active', timestamp: '2026-06-24T09:00:00', timeAgo: '2 days ago' },
];

export default function Reports() {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [status, setStatus] = useState('all');
  const [att, setAtt] = useState([]);
  const [pay, setPay] = useState([]);
  const [emps, setEmps] = useState([]);
  const [depts, setDepts] = useState([]);

  useEffect(() => {
    (async () => {
      const [a, p, e, d] = await Promise.all([
        api.get('/attendance'),
        api.get('/payroll'),
        api.get('/employees'),
        api.get('/departments'),
      ]);
      setAtt(a.data); setPay(p.data); setEmps(e.data); setDepts(d.data);
    })();
  }, []);

  const sectionSummary = useMemo(() => ({
    employeeCount: emps.length,
    attendanceCount: att.length,
    payrollCount: pay.length,
    departmentCount: depts.length,
  }), [emps.length, att.length, pay.length, depts.length]);

  const filteredReportCards = useMemo(() => {
    if (reportType === 'all') return REPORT_CARDS;
    return REPORT_CARDS.filter((card) => card.id === reportType);
  }, [reportType]);

  const filteredActivityFeed = useMemo(() => {
    return activityFeed.filter((activity) => {
      const matchesDepartment = departmentFilter === 'all' || activity.department === departmentFilter;
      const matchesEmployee = employeeFilter === 'all' || activity.user === employeeFilter;
      const matchesStatus = status === 'all' || activity.status === status;
      return matchesDepartment && matchesEmployee && matchesStatus;
    });
  }, [departmentFilter, employeeFilter, status]);

  const exportPlaceholder = (reportName) => {
    window.alert(`Placeholder export action for ${reportName}. Backend export integration can be added later.`);
  };

  const generatePlaceholder = (reportName) => {
    window.alert(`Placeholder generate action for ${reportName}. Report generation logic can be connected later.`);
  };

  return (
    <div className="space-y-6 animate-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-1">Reports Center</h1>
          <p className="caption text-secondary">Enterprise reporting with filtered export options and audit timeline.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="report-summary-card card p-5">
            <p className="caption uppercase tracking-[0.24em] text-secondary">Employees</p>
            <div className="mt-4 text-3xl font-bold">{sectionSummary.employeeCount}</div>
          </div>
          <div className="report-summary-card card p-5">
            <p className="caption uppercase tracking-[0.24em] text-secondary">Attendance</p>
            <div className="mt-4 text-3xl font-bold">{sectionSummary.attendanceCount}</div>
          </div>
          <div className="report-summary-card card p-5">
            <p className="caption uppercase tracking-[0.24em] text-secondary">Payroll runs</p>
            <div className="mt-4 text-3xl font-bold">{sectionSummary.payrollCount}</div>
          </div>
        </div>
      </div>

      <div className="card p-5 report-filter-toolbar">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label">Date from</label>
            <input className="input" type="date" value={dateRange.from} onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))} />
          </div>
          <div>
            <label className="label">Date to</label>
            <input className="input" type="date" value={dateRange.to} onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All departments</option>
              {depts.map((dept) => <option key={dept._id || dept.id} value={dept.name}>{dept.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Employee</label>
            <select className="input" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
              <option value="all">All employees</option>
              {emps.map((emp) => <option key={emp._id || emp.id} value={emp.name}>{emp.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="label">Report type</label>
            <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="all">All reports</option>
              <option value="employee">Employee</option>
              <option value="attendance">Attendance</option>
              <option value="payroll">Payroll</option>
              <option value="leave">Leave</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredReportCards.length > 0 ? (
            filteredReportCards.map((card) => (
              <ReportCard
                key={card.id}
                icon={card.icon}
                title={card.title}
                description={card.description}
                category={card.category}
                onGenerate={() => generatePlaceholder(card.title)}
                onExport={() => exportPlaceholder(card.title)}
              />
            ))
          ) : (
            <div className="card p-6 bg-surface border border-default text-center">
              <p className="heading-3">No reports match your filter</p>
              <p className="caption mt-2 text-secondary">Try adjusting the report type or filter options.</p>
            </div>
          )}
        </div>

        <ActivityTimeline activities={filteredActivityFeed} />
      </div>
    </div>
  );
}
