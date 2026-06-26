require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Attendance = require('./models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendance_payroll';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Wiping...');
  await Promise.all([
    User.deleteMany({}), Employee.deleteMany({}),
    Department.deleteMany({}), Attendance.deleteMany({}),
  ]);

  const depts = await Department.insertMany([
    { name: 'HR', head: 'Alice' },
    { name: 'IT', head: 'Bob' },
    { name: 'Finance', head: 'Carol' },
    { name: 'Marketing', head: 'Dave' },
  ]);

  const sample = [
    { name: 'John Doe',    email: 'john@demo.com',    designation: 'Software Engineer', salary: 5000, dept: 'IT' },
    { name: 'Jane Smith',  email: 'jane@demo.com',    designation: 'HR Manager',        salary: 4500, dept: 'HR' },
    { name: 'Mike Brown',  email: 'mike@demo.com',    designation: 'Accountant',        salary: 4200, dept: 'Finance' },
    { name: 'Sara Lee',    email: 'sara@demo.com',    designation: 'Marketing Lead',    salary: 4800, dept: 'Marketing' },
    { name: 'Tom White',   email: 'tom@demo.com',     designation: 'DevOps Engineer',   salary: 5200, dept: 'IT' },
  ];

  const employees = [];
  for (let i = 0; i < sample.length; i++) {
    const s = sample[i];
    const dept = depts.find(d => d.name === s.dept);
    const emp = await Employee.create({
      employeeId: 'EMP' + String(1001 + i),
      name: s.name, email: s.email, phone: '555-010' + i,
      designation: s.designation, salary: s.salary, department: dept._id,
    });
    await User.create({ name: s.name, email: s.email, password: 'employee123', role: 'employee', employee: emp._id });
    employees.push(emp);
  }

  await User.create({ name: 'Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin' });

  // some attendance records for past 10 days
  const today = new Date();
  for (const emp of employees) {
    for (let d = 1; d <= 10; d++) {
      const day = new Date(today); day.setDate(today.getDate() - d);
      const date = day.toISOString().slice(0, 10);
      const present = Math.random() > 0.15;
      if (!present) continue;
      const ci = new Date(day); ci.setHours(9, 0, 0, 0);
      const co = new Date(day); co.setHours(17 + Math.floor(Math.random()*2), 0, 0, 0);
      const hrs = Math.round(((co - ci) / 36e5) * 100) / 100;
      await Attendance.create({ employee: emp._id, date, checkIn: ci, checkOut: co, workingHours: hrs, status: 'present' });
    }
  }

  console.log('Seed done.');
  console.log('Admin:    admin@demo.com / admin123');
  console.log('Employee: john@demo.com  / employee123');
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
