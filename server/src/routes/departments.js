const router = require('express').Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const list = await Department.find().sort('name');
    const counts = await Employee.aggregate([{ $group: { _id: '$department', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map(c => [String(c._id), c.n]));
    res.json(list.map(d => ({ ...d.toObject(), employeeCount: map[String(d._id)] || 0 })));
  } catch (e) { next(e); }
});

router.post('/', role('admin'), async (req, res, next) => {
  try { res.json(await Department.create(req.body)); } catch (e) { next(e); }
});
router.put('/:id', role('admin'), async (req, res, next) => {
  try { res.json(await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })); } catch (e) { next(e); }
});
router.delete('/:id', role('admin'), async (req, res, next) => {
  try { await Department.findByIdAndDelete(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});

module.exports = router;
