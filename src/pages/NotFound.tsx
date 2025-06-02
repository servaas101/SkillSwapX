import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
      <p className="mt-2 text-lg text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Home className="mr-2 h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}