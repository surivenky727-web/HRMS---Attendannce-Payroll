const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  dob: Date,
  address: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: String,
  joiningDate: { type: Date, default: Date.now },
  salary: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  photo: String,
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
