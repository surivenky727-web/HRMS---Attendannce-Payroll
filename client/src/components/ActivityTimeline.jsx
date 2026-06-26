import { useMemo, useState } from 'react';

const activityIconMap = {
  employee_created: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M18 2l2 2-2 2" />
      <path d="M12 8h6" />
    </svg>
  ),
  employee_updated: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4" />
      <path d="M8 4h8" />
      <path d="m16 12 4 4-4 4" />
      <path d="M12 18H8a4 4 0 0 1-4-4V8" />
    </svg>
  ),
  attendance_marked: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4" />
      <path d="M12 22c4.42 0 8-3.58 8-8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9c0 4.42 3.58 8 8 8Z" />
    </svg>
  ),
  leave_requested: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M8 7V4h8v3" />
      <path d="M6 7v13h12V7" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </svg>
  ),
  leave_approved: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  payroll_generated: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
    </svg>
  ),
  department_created: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15V5h16v10" />
      <path d="M4 15l8 6 8-6" />
    </svg>
  ),
  user_logged_in: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 11v2a4 4 0 0 1-4 4H9" />
    </svg>
  ),
};

const statusClassMap = {
  employee_created: 'status-success',
  employee_updated: 'status-primary',
  attendance_marked: 'status-success',
  leave_requested: 'status-warning',
  leave_approved: 'status-success',
  payroll_generated: 'status-secondary',
  department_created: 'status-primary',
  user_logged_in: 'status-muted',
};

export default function ActivityTimeline({ activities = [] }) {
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = filter === 'all' || activity.type === filter;
      const matchesDate = !selectedDate || activity.timestamp.startsWith(selectedDate);
      return matchesType && matchesDate;
    });
  }, [activities, filter, selectedDate]);

  const activityTypes = [
    { id: 'all', label: 'All' },
    { id: 'employee_created', label: 'Employee created' },
    { id: 'employee_updated', label: 'Employee updated' },
    { id: 'attendance_marked', label: 'Attendance' },
    { id: 'leave_requested', label: 'Leave requested' },
    { id: 'leave_approved', label: 'Leave approved' },
    { id: 'payroll_generated', label: 'Payroll' },
    { id: 'department_created', label: 'Department' },
    { id: 'user_logged_in', label: 'Login' },
  ];

  return (
    <div className="card activity-timeline-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="heading-2">Activity timeline</h2>
          <p className="caption text-secondary">Track changes, approvals and recent user actions across the system.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="input" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {activityTypes.map((activityType) => (
              <option key={activityType.id} value={activityType.id}>{activityType.label}</option>
            ))}
          </select>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="timeline-list">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="timeline-item">
              <div className={`timeline-icon ${statusClassMap[activity.type] || 'status-unknown'}`}>
                {activityIconMap[activity.type] || activityIconMap.user_logged_in}
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <div>
                    <h3 className="heading-3 mb-1">{activity.title}</h3>
                    <p className="body text-secondary">{activity.description}</p>
                  </div>
                  <span className="timeline-time">{activity.timeAgo}</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-secondary">
                  <span className="status-badge status-present">{activity.user}</span>
                  <span className="status-badge status-muted">{activity.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-6 bg-surface border border-default text-center">
          <p className="heading-3">No activity found</p>
          <p className="caption mt-2 text-secondary">Try adjusting the filters or select a different date.</p>
        </div>
      )}
    </div>
  );
}
