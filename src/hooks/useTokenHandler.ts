import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { tokenStorage } from '@/lib/api';
import type { GoogleAuthResponse } from '@/lib/api';

interface UseTokenHandlerOptions {
  onSuccess?: (data: GoogleAuthResponse) => void;
  onError?: (error: string) => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
}

export const useTokenHandler = (options: UseTokenHandlerOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessingTokens, setIsProcessingTokens] = useState(false);

  useEffect(() => {
    // Extract authentication data from URL parameters
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const tokenType = searchParams.get('token_type');
    const expiresIn = searchParams.get('expires_in');
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    const provider = searchParams.get('provider');
    const firstLogin = searchParams.get('first_login');
    const profileComplete = searchParams.get('profile_complete');
    const isNewUser = searchParams.get('is_new_user');

    // Check for auth error
    const authError = searchParams.get('auth_error');
    const errorDescription = searchParams.get('error_description');

    if (authError) {
      const errorMsg = errorDescription ? decodeURIComponent(errorDescription) : authError;
      toast.error("Authentication failed", {
        description: errorMsg,
      });
      options.onError?.(errorMsg);
      
      // Clean up URL parameters
      setSearchParams({});
      return;
    }

    // If we have the required tokens, process them
    if (accessToken && refreshToken && userId && email) {
      console.log("Processing OAuth tokens from URL");
      setIsProcessingTokens(true);
      options.onProcessingStart?.();
      
      // Add a small delay to show the loading animation
      setTimeout(() => {
        const authData: GoogleAuthResponse = {
        access_token: accessToken,
        token_type: tokenType || 'Bearer',
        expires_in: parseInt(expiresIn || '3600', 10),
        refresh_token: refreshToken,
        user_id: userId,
        email: email,
        username: username || '',
        provider: provider || 'google',
        first_login: firstLogin === 'true',
        profile_complete: profileComplete === 'true',
        is_new_user: isNewUser === 'true',
      };

      // Store tokens in localStorage
      tokenStorage.setTokens(
        authData.access_token,
        authData.refresh_token,
        authData.expires_in
      );

      // Clean up URL parameters to remove tokens from browser history
      setSearchParams({});

      // Show success message
      toast.success("Authentication successful!");

      // Handle different user states
      if (authData.is_new_user) {
        toast.info("Welcome! Please complete your profile.", {
          description: "As a new user, we'd love to learn more about you.",
        });
      }

      if (!authData.profile_complete) {
        toast.info("Profile incomplete", {
          description: "Please complete your profile to get personalized recommendations.",
        });
        // Redirect to profile completion
        navigate("/profile/update", { 
          state: { isNewUser: authData.is_new_user },
          replace: true 
        });
      }

      // Call success callback
      options.onSuccess?.(authData);
      
      setIsProcessingTokens(false);
      options.onProcessingEnd?.();
      }, 1500); // 1.5 second delay to show the loading animation
    }
  }, [searchParams, setSearchParams, navigate, options]);

  return {
    // You can return any utility functions if needed
    clearTokensFromUrl: () => setSearchParams({}),
    isProcessingTokens,
  };
};

export default useTokenHandler; 