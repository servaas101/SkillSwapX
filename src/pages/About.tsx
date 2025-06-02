import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function About() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">About SkillSwapX</h1>
        <p className="mt-1 text-gray-500">
          Building the future of talent development and career data ownership
        </p>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900">Our Mission</h2>
          <p className="text-gray-600">
            SkillSwapX is revolutionizing how professionals own and manage their career data. 
            We believe your skills, achievements, and professional journey should belong to you forever, 
            not locked away in corporate systems.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">Core Values</h2>
          <ul className="mt-4 space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Data Ownership</h3>
                <p className="mt-1 text-gray-600">
                  Your professional identity should persist beyond any organization or platform.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Privacy First</h3>
                <p className="mt-1 text-gray-600">
                  Built with GDPR compliance and data privacy as core principles, not afterthoughts.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Skill Validation</h3>
                <p className="mt-1 text-gray-600">
                  Transparent, blockchain-verified skill endorsements and achievements.
                </p>
              </div>
            </li>
          </ul>

          <div className="mt-8">
            <Link
              to="/signup"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Join SkillSwapX
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}