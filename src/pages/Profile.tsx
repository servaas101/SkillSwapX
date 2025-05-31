import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { ProfileForm } from '../components/profile/ProfileForm';

export function Profile() {
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
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-gray-500">
          Manage your personal information. This data belongs to you and will persist even if you change organizations.
        </p>
      </div>
      
      <div className="flex justify-center">
        <ProfileForm />
      </div>
    </div>
  );
}