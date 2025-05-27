import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useAuth";
import { toast } from "sonner";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const {
    verifyEmail,
    isLoading,
    error: apiError,
    isSuccess,
    data,
  } = useVerifyEmail({
    onSuccess: (data) => {
      toast.success("Email verified successfully!", {
        description: "You can now log in to your account.",
      });
      // Store the token if needed
      localStorage.setItem("access_token", data.access_token);
      // Redirect to login or dashboard
      navigate("/");
    },
    onError: (error) => {
      toast.error("Verification failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required. Please go back to the registration page.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (otp.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    verifyEmail({ email, otp });
  };

  const handleResendOtp = () => {
    // You can implement resend OTP functionality here
    toast.info("Resend OTP functionality not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nutrition-green/20 via-nutrition-emerald/10 to-nutrition-lime/20 p-4">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl shadow-black/10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-nutrition-green/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-nutrition-green" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a verification code to{" "}
            <span className="font-medium text-nutrition-green">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Success Message */}
          {isSuccess && (
            <Alert className="bg-green-50/50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email verified successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {(error || apiError) && (
            <Alert className="bg-red-50/50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || apiError?.message}
                {apiError?.details && apiError.details.detail && (
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {apiError.details.detail.map((err, index) => (
                      <li key={index}>{err.msg}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-gray-700">
                Verification Code
              </Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                className="backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30 focus:border-nutrition-green transition-all duration-300 placeholder:text-gray-500 text-center text-lg tracking-[0.5em] font-mono"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-nutrition-green to-nutrition-emerald hover:from-nutrition-emerald hover:to-nutrition-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-nutrition-green hover:text-nutrition-emerald transition-colors font-medium underline"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
