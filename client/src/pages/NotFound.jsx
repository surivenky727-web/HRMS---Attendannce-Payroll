import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-page">
      <div className="display text-primary-700">404</div>
      <div className="body text-secondary mt-2">Page not found</div>
      <Link to="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
