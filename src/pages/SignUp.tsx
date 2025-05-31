import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { SignUpForm } from '../components/auth/SignUpForm';

export function SignUp() {
  const { usr } = useAuthContext();
  const nav = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (usr) {
      nav('/dashboard');
    }
  }, [usr, nav]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <SignUpForm />
    </div>
  );
}