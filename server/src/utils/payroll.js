function calcPayroll({ basicSalary, workingDays, presentDays, overtimeHours = 0, bonus = 0, deductions = 0, tax = 0 }) {
  const perDay = workingDays > 0 ? basicSalary / workingDays : 0;
  const hourlyRate = perDay / 8;
  const gross = perDay * presentDays + overtimeHours * hourlyRate;
  const net = gross + bonus - tax - deductions;
  return {
    grossSalary: Math.round(gross * 100) / 100,
    netSalary: Math.round(net * 100) / 100,
  };
}
module.exports = { calcPayroll };
