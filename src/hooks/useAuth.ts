import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  address: string;
  city: string;
}

interface AuthState {
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
  });

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginCredentials, redirectTo: string = '/user/overview') => {
      setState({ isLoading: true, error: null });

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Invalid email or password. Please try again.');
        }

        toast.success('Logged in successfully!');
        router.push(redirectTo);

        return { success: true, data };
      } catch (error: any) {
        const errorMessage = error.message || 'Invalid email or password. Please try again.';
        setState({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [router]
  );

  /**
   * Register user
   */
  const register = useCallback(
    async (userData: RegisterData) => {
      setState({ isLoading: true, error: null });

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to register.');
        }

        toast.success('Registration successful! Redirecting to payment...');

        // Redirect to payment if URL is provided
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }

        return { success: true, data };
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred during registration.';
        setState({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      toast.success('Logged out successfully');
      router.push('/user/login');

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to logout';
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [router]);

  /**
   * Reset password request
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setState({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      toast.success('Password reset link sent to your email!');
      setState({ isLoading: false, error: null });

      return { success: true, data };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send reset link';
      setState({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      setState({ isLoading: true, error: null });

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password');
        }

        toast.success('Password reset successfully!');
        router.push('/user/login');

        return { success: true, data };
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to reset password';
        setState({ isLoading: false, error: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [router]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    clearError,
  };
}
