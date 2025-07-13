import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
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
        const authError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (authError) {
          const errorMsg = errorDescription ? decodeURIComponent(errorDescription) : authError;
          setError(errorMsg);
          setStatus('error');
          toast.error("Authentication failed", {
            description: errorMsg,
          });
          return;
        }

        // Validate required authentication data
        if (!accessToken || !refreshToken || !userId || !email) {
          setError('Missing authentication data from Google callback');
          setStatus('error');
          toast.error("Authentication failed", {
            description: 'Missing required authentication data',
          });
          return;
        }

        // Process successful authentication
        const authData = {
          access_token: accessToken,
          token_type: tokenType || 'Bearer',
          expires_in: parseInt(expiresIn || '3600', 10),
          refresh_token: refreshToken,
          user_id: userId,
          email: email,
          username: username || email.split('@')[0],
          provider: provider || 'google',
          first_login: firstLogin === 'true',
          profile_complete: profileComplete === 'true',
          is_new_user: isNewUser === 'true',
        };

        // Update auth context with user data and tokens
        login(
          {
            id: authData.user_id,
            email: authData.email,
            username: authData.username,
          },
          {
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_in: authData.expires_in,
          }
        );

        setStatus('success');
        toast.success("Welcome back!", {
          description: "You've been successfully logged in.",
        });

        // Handle different user states with a single toast for new users
        if (authData.is_new_user && !authData.profile_complete) {
          // Show profile completion prompt after the redirect delay
          setTimeout(() => {
            toast.info("Please complete your profile", {
              description: "Help us personalize your nutrition journey.",
            });
          }, 2000);
        } else if (!authData.profile_complete) {
          // Show profile completion prompt for existing users
          setTimeout(() => {
            toast.info("Profile incomplete", {
              description: "Complete your profile for better recommendations.",
            });
          }, 2000);
        }

        // Add delay to show success state, then redirect
        setTimeout(() => {
          if (!authData.profile_complete) {
            navigate("/profile/update", { 
              state: { isNewUser: authData.is_new_user },
              replace: true 
            });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1500);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setStatus('error');
        toast.error("Authentication failed", {
          description: 'An unexpected error occurred',
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  const handleRetryLogin = () => {
    navigate('/', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
            </div>
            <CardTitle className="text-xl">Completing Authentication</CardTitle>
            <CardDescription>
              Please wait while we securely log you in...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing Google authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-700">Success!</CardTitle>
            <CardDescription>
              Authentication completed successfully. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-700">Authentication Failed</CardTitle>
            <CardDescription>
              There was a problem with your Google authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <Button onClick={handleRetryLogin} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default GoogleCallback; 