import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import NotFound from './pages/NotFound.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import Employees from './pages/admin/Employees.jsx';
import AdminAttendance from './pages/admin/Attendance.jsx';
import AdminLeaves from './pages/admin/Leaves.jsx';
import AdminPayroll from './pages/admin/Payroll.jsx';
import Departments from './pages/admin/Departments.jsx';
import Reports from './pages/admin/Reports.jsx';

import EmployeeDashboard from './pages/employee/Dashboard.jsx';
import EmployeeAttendance from './pages/employee/Attendance.jsx';
import EmployeeLeaves from './pages/employee/Leaves.jsx';
import EmployeePayslips from './pages/employee/Payslips.jsx';
import Profile from './pages/employee/Profile.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<Employees />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/leaves" element={<AdminLeaves />} />
        <Route path="/admin/payroll" element={<AdminPayroll />} />
        <Route path="/admin/departments" element={<Departments />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      <Route element={<ProtectedRoute roles={['employee']}><Layout /></ProtectedRoute>}>
        <Route path="/me" element={<EmployeeDashboard />} />
        <Route path="/me/attendance" element={<EmployeeAttendance />} />
        <Route path="/me/leaves" element={<EmployeeLeaves />} />
        <Route path="/me/payslips" element={<EmployeePayslips />} />
        <Route path="/me/profile" element={<Profile />} />
        <Route path="/me/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
