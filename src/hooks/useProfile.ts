import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  avatar_url?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  address?: string | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string | null;
  gender?: string | null;
  blood_group?: string | null;
  address?: string | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profiles/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user profile');
      }

      setProfile(result.data || null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching profile';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (input: UpdateProfileInput): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
    try {
      const response = await fetch('/api/profiles/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update profile' };
      }

      const updated: UserProfile = result.data;
      setProfile((prev) => ({ ...prev, ...updated }));
      return { success: true, data: updated };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating profile';
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}
