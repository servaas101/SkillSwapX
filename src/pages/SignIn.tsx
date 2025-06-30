import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { SignInForm } from '../components/auth/SignInForm';

export function SignIn() {
  const { usr } = useAuth();
  const nav = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (usr) {
      nav('/dashboard');
    }
  }, [usr, nav]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <SignInForm />
    </div>
  );
}