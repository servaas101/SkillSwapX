import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { GDPRConsent } from '../components/gdpr/GDPRConsent';

export function PrivacySettings() {
  const { usr } = useAuthContext();
  const nav = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!usr) {
      nav('/signin');
    }
  }, [usr, nav]);

  if (!usr) {
    return null; // Redirect will happen via the useEffect
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your data privacy preferences and GDPR rights
        </p>
      </div>
      
      <div className="flex justify-center">
        <GDPRConsent />
      </div>
    </div>
  );
}