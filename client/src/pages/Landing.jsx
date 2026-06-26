import { Link } from 'react-router-dom';
export default function Landing() {
  return (
    <div className="min-h-screen bg-page-hero animate-page">
      <header className="px-8 py-6 flex justify-between items-center">
        <div className="heading-3 text-primary-700">HRMS Pro</div>
        <div className="space-x-2">
          <Link className="btn-ghost" to="/login">Login</Link>
          <Link className="btn-primary" to="/register">Register</Link>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <h1 className="display text-primary mb-4">Modern Attendance & Payroll, simplified.</h1>
        <p className="body text-secondary max-w-2xl mx-auto mb-8">
          Manage employees, attendance, leave, and payroll in one beautiful workspace.
        </p>
        <Link to="/login" className="btn-primary text-lg px-6 py-3">Get started</Link>
      </section>
      <section className="max-w-6xl mx-auto px-8 grid md:grid-cols-3 gap-6 pb-20">
        {['Attendance tracking','Payroll automation','Leave management'].map(t => (
          <div key={t} className="card">
            <div className="heading-3 text-primary-700 mb-2">{t}</div>
              <div className="body text-secondary">Fast, accurate, and built for teams of any size.</div>
          </div>
        ))}
      </section>
    </div>
  );
}
