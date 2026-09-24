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
  next_of_kin_relationship?: string | null;
  passport_url?: string | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string | null;
  gender?: "male" | "female" | "other" | string | null;
  blood_group?: string | null;
  address?: string | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_relationship?: string | null;
  passport_url?: string | null;
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

  const updateProfile = async (
    input: UpdateProfileInput
  ): Promise<{ success: boolean; data?: Partial<UserProfile>; error?: string }> => {
    try {
      const response = await fetch('/api/settings/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to update profile' };
      }

      const { profile: updatedProfileRow, patient: updatedPatientRow } = result.data || {};
      const flattenedUpdated: Partial<UserProfile> = {
        ...(updatedProfileRow || {}),
        ...(updatedPatientRow || {}),
      };

      setProfile((prev) => (prev ? { ...prev, ...flattenedUpdated } : null));
      return { success: true, data: flattenedUpdated };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating profile';
      return { success: false, error: message };
    }
  };

  const uploadPassport = async (
    file: File
  ): Promise<{ success: boolean; path?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/passport', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to upload passport' };
      }

      const { path: storagePath, signedUrl } = result.data || {};
      if (storagePath) {
        const updateRes = await updateProfile({ passport_url: storagePath });
        if (!updateRes.success) {
          return { success: false, error: updateRes.error || 'Failed to save passport path to profile' };
        }
        if (signedUrl) {
          setProfile((prev) => (prev ? { ...prev, passport_url: signedUrl } : null));
        }
      }

      return { success: true, path: storagePath };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while uploading passport';
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
    uploadPassport,
  };
}

