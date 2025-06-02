import { Shield, User, Database, BrainCircuit, Users, Award } from 'lucide-react';

export function Platform() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Our Platform</h1>
        <p className="mt-1 text-gray-500">
          A comprehensive ecosystem for professional development
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Digital Identity</h3>
          <p className="mt-2 text-gray-600">
            Own your professional identity with blockchain-verified credentials.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Data Privacy</h3>
          <p className="mt-2 text-gray-600">
            GDPR-compliant data handling with granular privacy controls.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Storage</h3>
          <p className="mt-2 text-gray-600">
            Enterprise-grade encryption for your professional data.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100">
            <BrainCircuit className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">AI Analytics</h3>
          <p className="mt-2 text-gray-600">
            Smart insights for career development and skill gaps.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100">
            <Users className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Mentorship</h3>
          <p className="mt-2 text-gray-600">
            Connect with industry experts for guided growth.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100">
            <Award className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Achievements</h3>
          <p className="mt-2 text-gray-600">
            Earn and showcase verified skills and certifications.
          </p>
        </div>
      </div>
    </div>
  );
}