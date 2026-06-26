const router = require('express').Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

router.use(auth);

function today() { return new Date().toISOString().slice(0, 10); }

router.post('/checkin', async (req, res, next) => {
  try {
    const empId = req.user.employee;
    if (!empId) return res.status(400).json({ message: 'No employee profile' });
    const date = today();
    let rec = await Attendance.findOne({ employee: empId, date });
    if (rec && rec.checkIn) return res.status(400).json({ message: 'Already checked in' });
    if (!rec) rec = new Attendance({ employee: empId, date });
    rec.checkIn = new Date();
    rec.status = 'present';
    await rec.save();
    res.json(rec);
  } catch (e) { next(e); }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const empId = req.user.employee;
    const date = today();
    const rec = await Attendance.findOne({ employee: empId, date });
    if (!rec || !rec.checkIn) return res.status(400).json({ message: 'Not checked in' });
    rec.checkOut = new Date();
    const ms = rec.checkOut - rec.checkIn;
    rec.workingHours = Math.round((ms / 36e5) * 100) / 100;
    rec.status = rec.workingHours >= 4 ? (rec.workingHours >= 7 ? 'present' : 'half-day') : 'half-day';
    await rec.save();
    res.json(rec);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const { from, to, employee } = req.query;
    const filter = {};
    if (req.user.role !== 'admin') filter.employee = req.user.employee;
    else if (employee) filter.employee = employee;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }
    const list = await Attendance.find(filter).populate('employee').sort('-date');
    res.json(list);
  } catch (e) { next(e); }
});

module.exports = router;
