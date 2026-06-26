const router = require('express').Router();
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.post('/', async (req, res, next) => {
  try {
    const empId = req.user.employee;
    if (!empId) return res.status(400).json({ message: 'No employee profile' });
    const { leaveType, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({ employee: empId, leaveType, startDate, endDate, reason });
    res.json(leave);
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { employee: req.user.employee };
    const list = await Leave.find(filter).populate('employee').sort('-createdAt');
    res.json(list);
  } catch (e) { next(e); }
});

router.put('/:id', role('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(leave);
  } catch (e) { next(e); }
});

module.exports = router;
