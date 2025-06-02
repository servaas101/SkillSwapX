import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../components/auth/AuthProvider';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../store/auth';

// Mock components
const Dashboard = () => <div>Dashboard</div>;
const Profile = () => <div>Profile</div>;
const Login = () => <div>Login</div>;
const PublicPage = () => <div>Public Page</div>;

// Mock auth hook
vi.mock('../store/auth', () => ({
  useAuth: vi.fn()
}));

describe('Routing System', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Public Routes', () => {
    it('should render public routes without authentication', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: null,
        ldg: false,
        init: true
      });

      render(
        <MemoryRouter initialEntries={['/public']}>
          <AuthProvider>
            <Routes>
              <Route path="/public" element={<PublicPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });

    it('should allow navigation between public routes', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: null,
        ldg: false,
        init: true
      });

      const { rerender } = render(
        <MemoryRouter initialEntries={['/about']}>
          <AuthProvider>
            <Routes>
              <Route path="/about" element={<PublicPage />} />
              <Route path="/faq" element={<PublicPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Page')).toBeInTheDocument();

      rerender(
        <MemoryRouter initialEntries={['/faq']}>
          <AuthProvider>
            <Routes>
              <Route path="/about" element={<PublicPage />} />
              <Route path="/faq" element={<PublicPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route while unauthenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: null,
        ldg: false,
        init: true
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should render protected route when authenticated', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: { id: '123', email: 'test@example.com' },
        ldg: false,
        init: true,
        gdp: true
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should show loading state while checking auth', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: null,
        ldg: true,
        init: false
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('GDPR Consent Routes', () => {
    it('should redirect to privacy settings if GDPR consent not given', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: { id: '123', email: 'test@example.com' },
        ldg: false,
        init: true,
        gdp: false
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/privacy-settings" element={<PublicPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireGdpr>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle route errors gracefully', () => {
      vi.mocked(useAuth).mockReturnValue({
        usr: null,
        ldg: false,
        init: true
      });

      render(
        <MemoryRouter initialEntries={['/invalid-route']}>
          <AuthProvider>
            <Routes>
              <Route path="*" element={<div>404 Not Found</div>} />
              }
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });
  });
});