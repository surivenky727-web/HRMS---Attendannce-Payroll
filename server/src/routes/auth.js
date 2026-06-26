const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role, employee: user.employee }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, employeeId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    // create employee record too
    const emp = await Employee.create({
      employeeId: employeeId || ('EMP' + Date.now().toString().slice(-6)),
      name, email, phone,
    });
    const user = await User.create({ name, email, password, role: 'employee', employee: emp._id });
    const token = sign(user);
    res.json({ token, user: { id: user._id, name, email, role: user.role, employee: emp._id } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.compare(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = sign(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, employee: user.employee } });
  } catch (e) { next(e); }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true }); // do not leak
    const token = crypto.randomBytes(24).toString('hex');
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    // dev: return token; production: send email
    res.json({ ok: true, devResetToken: token });
  } catch (e) { next(e); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
