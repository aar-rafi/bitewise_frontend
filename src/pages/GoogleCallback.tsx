import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleCallback } from "@/hooks/useAuth";
import { toast } from "sonner";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorDetails, setErrorDetails] = useState<string>("");

  const { googleCallback, isLoading, error } = useGoogleCallback({
    onSuccess: (data) => {
      setStatus('success');
      toast.success("Successfully signed in with Google!", {
        description: `Welcome${data.first_login ? ' to BiteWise' : ' back'}!`,
      });

      // Navigate based on user status
      setTimeout(() => {
        if (data.is_new_user || (data.first_login && data.setup_required)) {
          navigate("/setup-profile", { 
            state: { 
              fromGoogleAuth: true,
              userInfo: data 
            }
          });
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    },
    onError: (error) => {
      setStatus('error');
      
      // Enhanced error handling for different types of OAuth errors
      let errorMessage = "Google authentication failed";
      let errorDescription = error.message;
      
      // Handle specific error cases
      if (error.status === 400) {
        if (error.message.includes("state")) {
          errorMessage = "Security Verification Failed";
          errorDescription = "The authentication request appears to be invalid or tampered with.";
        } else if (error.message.includes("code")) {
          errorMessage = "Invalid Authorization";
          errorDescription = "The authorization code from Google is invalid or expired.";
        } else {
          errorMessage = "Invalid OAuth Request";
          errorDescription = "The OAuth request was invalid. Please try again.";
        }
      } else if (error.status === 401) {
        errorMessage = "OAuth Authentication Failed";
        errorDescription = "Google authentication was rejected. Please try again.";
      } else if (error.status === 0) {
        errorMessage = "Network Error";
        errorDescription = "Unable to connect to the authentication server. Please check your connection.";
      }
      
      setErrorDetails(`Status: ${error.status}, Message: ${error.message}`);
      
      // Log additional details for debugging
      console.error("Google OAuth callback error:", {
        status: error.status,
        message: error.message,
        details: error.details,
        searchParams: Object.fromEntries(searchParams.entries())
      });
      
      toast.error(errorMessage, { description: errorDescription });
      
      // Navigate back to login after delay
      setTimeout(() => {
        navigate("/", { 
          state: { 
            error: `${errorMessage}: ${errorDescription}` 
          }
        });
      }, 5000);
    },
  });

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log("Google OAuth callback parameters:", {
          code: code ? "present" : "missing",
          state: state ? "present" : "missing",
          error: error,
          errorDescription: errorDescription
        });

        // Handle OAuth errors from Google
        if (error) {
          setStatus('error');
          const description = errorDescription || "Authentication was cancelled or failed.";
          
          if (error === 'access_denied') {
            toast.error("Google authentication cancelled", { 
              description: "You cancelled the Google authentication process." 
            });
          } else {
            toast.error("Google authentication error", { description });
          }
          
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // Verify required parameters
        if (!code) {
          setStatus('error');
          toast.error("Invalid authentication response", {
            description: "No authorization code received from Google.",
          });
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        // Make the callback request to exchange code for tokens
        console.log("Making Google OAuth callback request...");
        googleCallback({ code, state: state || '' });

      } catch (callbackError) {
        console.error("OAuth callback handling error:", callbackError);
        setStatus('error');
        toast.error("Authentication processing failed", {
          description: "An unexpected error occurred while processing authentication.",
        });
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, googleCallback, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-nutrition-green mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">
              Completing Google Sign-In
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your Google account and complete the authentication...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">
              Successfully Signed In!
            </h2>
            <p className="text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-800">
              Authentication Failed
            </h2>
            <p className="text-gray-600">
              {error?.message || "Something went wrong during authentication."}
            </p>
            {errorDetails && (
              <details className="text-xs text-gray-500 mt-2">
                <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
                <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-w-full">
                  {errorDetails}
                </pre>
              </details>
            )}
            <p className="text-sm text-gray-500">
              Redirecting you back to the login page...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutrition-mint to-nutrition-sage flex items-center justify-center p-4">
      <Card className="max-w-md w-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-gray-800">
            Google Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && status === 'error' && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback; 