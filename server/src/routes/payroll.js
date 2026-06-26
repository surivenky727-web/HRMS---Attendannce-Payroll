const router = require('express').Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { calcPayroll } = require('../utils/payroll');
const { streamPayslip } = require('../utils/payslipPdf');

router.use(auth);

router.post('/generate', role('admin'), async (req, res, next) => {
  try {
    const { employeeId, month, year, workingDays = 22, overtimeHours = 0, bonus = 0, deductions = 0, tax = 0 } = req.body;
    const emp = await Employee.findById(employeeId);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // count present days in that month
    const m = String(month).padStart(2, '0');
    const from = `${year}-${m}-01`;
    const to = `${year}-${m}-31`;
    const records = await Attendance.find({ employee: emp._id, date: { $gte: from, $lte: to } });
    const presentDays = records.filter(r => r.status === 'present' || r.status === 'half-day').length;

    const { grossSalary, netSalary } = calcPayroll({
      basicSalary: emp.salary, workingDays, presentDays, overtimeHours, bonus, deductions, tax
    });

    const data = {
      employee: emp._id, month, year, workingDays, presentDays,
      basicSalary: emp.salary, overtimeHours, bonus, deductions, tax,
      grossSalary, netSalary,
    };
    const payroll = await Payroll.findOneAndUpdate(
      { employee: emp._id, month, year },
      data,
      { new: true, upsert: true }
    );
    res.json(payroll);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { employee: req.user.employee };
    if (req.query.month) filter.month = Number(req.query.month);
    if (req.query.year) filter.year = Number(req.query.year);
    const list = await Payroll.find(filter).populate({ path: 'employee', populate: { path: 'department' } }).sort('-year -month');
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/payslip/:id', async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate({ path: 'employee', populate: { path: 'department' } });
    if (!payroll) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && String(payroll.employee._id) !== String(req.user.employee)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    streamPayslip(res, { payroll, employee: payroll.employee, department: payroll.employee.department });
  } catch (e) { next(e); }
});

module.exports = router;
