import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sb } from '../lib/supabase';
import { useAuth } from '../store/auth';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  sb: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when accessing protected route', async () => {
      // Mock no session
      vi.mocked(sb.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const wrapper = ({ children }) => (
        <MemoryRouter initialEntries={['/profile']}>
          {children}
        </MemoryRouter>
      );

      const { result } = renderHook(() => useLocation(), { wrapper });
      expect(result.current.pathname).toBe('/signin');
    });

    it('should allow access to public routes', async () => {
      const publicRoutes = ['/about', '/faq', '/terms'];
      
      for (const route of publicRoutes) {
        const wrapper = ({ children }) => (
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        );

        const { result } = renderHook(() => useLocation(), { wrapper });
        expect(result.current.pathname).toBe(route);
      }
    });

    it('should show proper error for unauthorized access', async () => {
      const { result } = renderHook(() => useAuth());
      
      const signInResult = await result.current.signIn('test@example.com', 'wrong');
      expect(signInResult.err).toBeTruthy();
    });
  });

  describe('Authentication Process', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com'
      };

      const mockSession = {
        access_token: 'mock-token',
        user: mockUser
      };

      vi.mocked(sb.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });

      vi.mocked(sb.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: { gdp: true },
              error: null
            })
          })
        })
      }));

      const { result } = renderHook(() => useAuth());
      
      const signInResult = await result.current.signIn('test@example.com', 'password');
      expect(signInResult.err).toBeUndefined();
      expect(result.current.usr).toEqual(mockUser);
    });

    it('should handle login errors correctly', async () => {
      vi.mocked(sb.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' }
      });

      const { result } = renderHook(() => useAuth());
      
      const signInResult = await result.current.signIn('test@example.com', 'wrong');
      expect(signInResult.err).toBe('Invalid credentials');
    });

    it('should handle network errors during login', async () => {
      vi.mocked(sb.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth());
      
      const signInResult = await result.current.signIn('test@example.com', 'password');
      expect(signInResult.err).toBeTruthy();
    });
  });

  describe('Authenticated State', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    };

    const mockSession = {
      access_token: 'mock-token',
      user: mockUser
    };

    beforeEach(() => {
      // Mock authenticated session
      vi.mocked(sb.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });
    });

    it('should allow access to protected routes when authenticated', async () => {
      const protectedRoutes = ['/dashboard', '/profile', '/settings'];
      
      for (const route of protectedRoutes) {
        const wrapper = ({ children }) => (
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        );

        const { result } = renderHook(() => useLocation(), { wrapper });
        expect(result.current.pathname).toBe(route);
      }
    });

    it('should handle session expiration', async () => {
      vi.mocked(sb.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              error: { message: 'JWT expired' }
            })
          })
        })
      }));

      const { result } = renderHook(() => useAuth());
      
      // Trigger a profile fetch to simulate expired token
      await result.current.loadUsr();
      
      expect(result.current.usr).toBeNull();
      expect(sb.auth.signOut).toHaveBeenCalled();
    });

    it('should clear auth state on logout', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signOut();
      
      expect(result.current.usr).toBeNull();
      expect(result.current.ses).toBeNull();
      expect(localStorage.getItem('sb.session')).toBeNull();
    });
  });

  describe('API Request Handling', () => {
    it('should include correct headers in API requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: {} })
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useAuth());
      
      // Trigger an API request
      await result.current.loadUsr();
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle 406 responses correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 406
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useAuth());
      
      // Trigger an API request
      const apiResult = await result.current.loadUsr();
      
      expect(apiResult).toBeFalsy();
    });
  });
});