export default function ReportCard({ icon, title, description, category, onGenerate, onExport }) {
  return (
    <div className="card report-card group transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="report-card-icon">{icon}</div>
        <div className="min-w-0 text-right">
          <p className="text-xs uppercase tracking-[0.26em] text-secondary">{category}</p>
          <h3 className="heading-3 mt-2 text-right">{title}</h3>
        </div>
      </div>
      <p className="caption mt-5 text-secondary">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-ghost" onClick={onGenerate}>Generate</button>
        <button type="button" className="btn btn-primary" onClick={onExport}>Export</button>
      </div>
    </div>
  );
}
