import { ArrowRight, Building2, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Company() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Our Company</h1>
        <p className="mt-1 text-gray-500">
          Building the future of professional development
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Our Mission</h3>
          <p className="mt-2 text-gray-600">
            Empowering professionals to own their career data and development journey.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Our Team</h3>
          <p className="mt-2 text-gray-600">
            Diverse experts committed to revolutionizing professional development.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100">
            <Globe className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Global Impact</h3>
          <p className="mt-2 text-gray-600">
            Connecting talent across borders and organizations.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <Link
          to="/careers"
          className="inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          Join our team
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}