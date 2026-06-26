export default function StatCard({ label, value, accent = 'bg-primary-50 text-primary-700' }) {
  return (
    <div className="card">
      <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${accent}`}>{label}</div>
      <div className="text-3xl font-bold text-primary mt-2">{value}</div>
    </div>
  );
}
