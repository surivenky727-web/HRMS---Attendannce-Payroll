const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  head: String,
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
