const router = require('express').Router();
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const { q, department, status } = req.query;
    const filter = {};
    if (q) filter.$or = [
      { name: new RegExp(q, 'i') },
      { employeeId: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
    ];
    if (department) filter.department = department;
    if (status) filter.status = status;
    const list = await Employee.find(filter).populate('department').sort('-createdAt');
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try { res.json(await Employee.findById(req.params.id).populate('department')); }
  catch (e) { next(e); }
});

router.post('/', role('admin'), async (req, res, next) => {
  try { res.json(await Employee.create(req.body)); }
  catch (e) { next(e); }
});

router.put('/:id', role('admin'), async (req, res, next) => {
  try { res.json(await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { next(e); }
});

router.delete('/:id', role('admin'), async (req, res, next) => {
  try { await Employee.findByIdAndDelete(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

module.exports = router;
