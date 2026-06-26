const PDFDocument = require('pdfkit');

function streamPayslip(res, { payroll, employee, department }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=payslip-${employee.employeeId}-${payroll.month}-${payroll.year}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('PAYSLIP', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#666').text('Acme Corporation', { align: 'center' });
  doc.fillColor('black');
  doc.moveDown();

  doc.fontSize(12).text(`For: ${monthName(payroll.month)} ${payroll.year}`);
  doc.moveDown();

  doc.fontSize(11);
  doc.text(`Employee ID: ${employee.employeeId}`);
  doc.text(`Name:        ${employee.name}`);
  doc.text(`Email:       ${employee.email}`);
  doc.text(`Department:  ${department ? department.name : '-'}`);
  doc.text(`Designation: ${employee.designation || '-'}`);
  doc.moveDown();

  doc.text(`Working Days: ${payroll.workingDays}`);
  doc.text(`Present Days: ${payroll.presentDays}`);
  doc.text(`Overtime Hrs: ${payroll.overtimeHours}`);
  doc.moveDown();

  const row = (label, value) => doc.text(`${label.padEnd(25, ' ')} ${value}`);
  row('Basic Salary',  fmt(payroll.basicSalary));
  row('Gross Salary',  fmt(payroll.grossSalary));
  row('Bonus',         fmt(payroll.bonus));
  row('Tax',           fmt(payroll.tax));
  row('Deductions',    fmt(payroll.deductions));
  doc.moveDown();
  doc.fontSize(14).text(`NET SALARY: ${fmt(payroll.netSalary)}`, { underline: true });

  doc.moveDown(2);
  doc.fontSize(9).fillColor('#888').text('This is a system generated payslip.', { align: 'center' });

  doc.end();
}

function fmt(n) { return '$ ' + Number(n || 0).toFixed(2); }
function monthName(m) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m-1] || '';
}

module.exports = { streamPayslip };
