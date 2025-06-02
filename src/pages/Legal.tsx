import { ArrowRight, Scale, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Legal() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Legal Information</h1>
        <p className="mt-1 text-gray-500">
          Important legal documents and compliance information
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Privacy Policy</h2>
              <p className="mt-1 text-sm text-gray-500">
                How we handle and protect your data
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/privacy"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Privacy Policy
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 text-green-600">
              <Scale className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Terms of Service</h2>
              <p className="mt-1 text-sm text-gray-500">
                Rules and guidelines for using our platform
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/terms"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Terms of Service
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Cookie Policy</h2>
              <p className="mt-1 text-sm text-gray-500">
                Information about how we use cookies
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/cookies"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Cookie Policy
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 text-yellow-600">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">GDPR Compliance</h2>
              <p className="mt-1 text-sm text-gray-500">
                Our commitment to data protection
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/gdpr"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View GDPR Information
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h2 className="text-lg font-medium text-gray-900">Additional Resources</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between border-t border-gray-200 py-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">Data Processing Agreement</h3>
              <p className="mt-1 text-sm text-gray-500">For business customers and partners</p>
            </div>
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Download PDF
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 py-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">Security Whitepaper</h3>
              <p className="mt-1 text-sm text-gray-500">Technical security measures</p>
            </div>
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              Download PDF
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 py-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">Compliance Certificates</h3>
              <p className="mt-1 text-sm text-gray-500">ISO 27001, SOC 2, and more</p>
            </div>
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
              View Certificates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}