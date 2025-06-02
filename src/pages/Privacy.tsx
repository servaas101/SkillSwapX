import { Shield, Lock, UserCheck, Download, Trash2 } from 'lucide-react';
import { GDPRConsent } from '../components/gdpr/GDPRConsent';

export function Privacy() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-1 text-gray-500">
          Learn how SkillSwapX protects your data and respects your privacy rights
        </p>
      </div>

      {/* Key Privacy Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Data Protection</h3>
          <p className="mt-2 text-gray-500">
            Your data is encrypted and protected using industry-standard security measures
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100">
            <Lock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Privacy Controls</h3>
          <p className="mt-2 text-gray-500">
            Full control over your data sharing preferences and visibility settings
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100">
            <UserCheck className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">GDPR Compliance</h3>
          <p className="mt-2 text-gray-500">
            We respect and protect your rights under GDPR and other privacy regulations
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100">
            <Download className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Data Portability</h3>
          <p className="mt-2 text-gray-500">
            Export your data anytime in standard formats for easy portability
          </p>
        </div>
      </div>

      {/* Privacy Policy Content */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="prose max-w-none">
          <h2 className="text-xl font-bold text-gray-900">Our Commitment to Privacy</h2>
          <p className="mt-4 text-gray-600">
            At SkillSwapX, we believe that your career data belongs to you. Our platform is built on the principle of data ownership, ensuring that you maintain control over your professional information throughout your career journey.
          </p>

          <h3 className="mt-8 text-lg font-bold text-gray-900">Data Collection</h3>
          <p className="mt-2 text-gray-600">
            We collect only the information necessary to provide our services:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            <li>Basic profile information (name, email)</li>
            <li>Professional details (skills, experience, certifications)</li>
            <li>Usage data to improve our services</li>
            <li>Communication preferences</li>
          </ul>

          <h3 className="mt-8 text-lg font-bold text-gray-900">Data Usage</h3>
          <p className="mt-2 text-gray-600">
            Your data is used exclusively for:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            <li>Providing and improving our services</li>
            <li>Matching you with relevant opportunities</li>
            <li>Verifying skills and achievements</li>
            <li>Communication about our services</li>
          </ul>

          <h3 className="mt-8 text-lg font-bold text-gray-900">Your Rights</h3>
          <p className="mt-2 text-gray-600">
            Under GDPR and other privacy regulations, you have the right to:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request data deletion</li>
            <li>Export your data</li>
            <li>Object to data processing</li>
            <li>Withdraw consent</li>
          </ul>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h2 className="text-xl font-bold text-gray-900">Privacy Controls</h2>
        <p className="mt-2 text-gray-600">
          Manage your privacy settings and data preferences below:
        </p>
        <div className="mt-6">
          <GDPRConsent />
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
        <p className="mt-2 text-gray-600">
          For privacy-related inquiries or to exercise your data rights, please contact our Data Protection Officer:
        </p>
        <div className="mt-4">
          <p className="text-gray-600">Email: privacy@skillswapx.com</p>
          <p className="text-gray-600">Address: 123 Privacy Street, Data City, 12345</p>
        </div>
      </div>
    </div>
  );
}