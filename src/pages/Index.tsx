import React, { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Apple,
  Leaf,
  Heart,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import FloatingFoodAnimation3D from "@/components/FloatingFoodAnimation3D";
import { useRegister, useLogin, useVerifyLogin } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile";
import ProfileUpdate from "./ProfileUpdate";

const Index = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showLoginOtp, setShowLoginOtp] = useState(false);
  const [loginRequestId, setLoginRequestId] = useState("");
  const [loginOtp, setLoginOtp] = useState("");

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    register,
    isLoading: isRegisterLoading,
    error: registerError,
    isSuccess: isRegisterSuccess,
    data: registerData,
    reset: resetRegister,
  } = useRegister({
    onSuccess: (data) => {
      toast.success("Registration successful!", {
        description: "Please check your email for the verification code.",
      });
      // Redirect to verification page with email
      navigate("/verify-email", { state: { email: data.email } });
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description: error.message,
      });
    },
  });

  const {
    login,
    isLoading: isLoginLoading,
    error: loginError,
  } = useLogin({
    onSuccess: (data) => {
      setLoginRequestId(data.login_request_id);
      setShowLoginOtp(true);
      toast.success("Please check your email for the verification code");
    },
    onError: (error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });

  const { verifyLogin, isLoading: isVerifyLoginLoading } = useVerifyLogin({
    onSuccess: () => {
      toast.success("Login successful!");
      // Reset form and states
      setShowLoginOtp(false);
      setLoginOtp("");
      setLoginRequestId("");
      // Navigate to dashboard
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error("Verification failed", {
        description: error.message,
      });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp) {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!username.trim()) {
        newErrors.username = "Username is required";
      } else if (username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (showLoginOtp && !loginOtp.trim()) {
      newErrors.otp = "Verification code is required";
    } else if (showLoginOtp && !/^\d{6}$/.test(loginOtp)) {
      newErrors.otp = "Please enter a valid 6-digit code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (showLoginOtp) {
      verifyLogin({
        login_request_id: loginRequestId,
        otp: loginOtp,
      });
      return;
    }

    if (isSignUp) {
      register({
        email,
        password,
        username,
        full_name: fullName,
      });
    } else {
      login({
        email,
        password,
      });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Reset form fields and states
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setUsername("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowLoginOtp(false);
    setLoginOtp("");
    setLoginRequestId("");
    setErrors({});
    resetRegister();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <FloatingFoodAnimation3D />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Space for animations */}
        <div className="flex-1 flex items-center justify-center p-4">
          {/* This space is reserved for your animations */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-nutrition-green/20 to-nutrition-emerald rounded-full mb-6 shadow-lg">
              <img src="/logo2.png" alt="Bitewise Logo" className="w-32 h-32" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent mb-4">
              BITEWISE
            </h1>
            <p className="text-gray-600 text-lg">
              Your personal nutrition companion
            </p>
          </div>
        </div>

        {/* Right side - Login/Signup Form */}
        <div className="w-full max-w-md p-4 flex flex-col justify-center -translate-x-28">
          {/* Glass Login/Signup Card */}
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl shadow-black/10 relative overflow-hidden transition-all duration-500 ease-in-out">
            {/* Glass shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-glass-shimmer"></div>

            <CardHeader className="space-y-1 text-center relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-800 transition-all duration-300">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-gray-600 transition-all duration-300">
                {isSignUp
                  ? "Join us to start your nutrition journey"
                  : "Sign in to track your nutrition journey"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Success Message */}
              {isRegisterSuccess && (
                <Alert className="bg-green-50/50 border-green-200 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Registration successful! Please check your email for
                    verification.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {registerError && (
                <Alert className="bg-red-50/50 border-red-200 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {registerError.message}
                    {registerError.details && registerError.details.detail && (
                      <ul className="mt-2 list-disc list-inside text-sm">
                        {registerError.details.detail.map((err, index) => (
                          <li key={index}>{err.msg}</li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!showLoginOtp ? (
                  <>
                    {/* Full Name Field - Only for Sign Up */}
                    <div
                      className={`space-y-2 transition-all duration-300 overflow-hidden ${
                        isSignUp ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <Label
                        htmlFor="fullName"
                        className="text-gray-700 font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 ${
                          errors.fullName
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                        required={isSignUp}
                        disabled={isRegisterLoading}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Username Field - Only for Sign Up */}
                    <div
                      className={`space-y-2 transition-all duration-300 overflow-hidden ${
                        isSignUp ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <Label
                        htmlFor="username"
                        className="text-gray-700 font-medium"
                      >
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 ${
                          errors.username
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                        required={isSignUp}
                        disabled={isRegisterLoading}
                      />
                      {errors.username && (
                        <p className="text-sm text-red-600">
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 ${
                          errors.email
                            ? "border-red-400 focus:border-red-400"
                            : ""
                        }`}
                        required
                        disabled={isRegisterLoading}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 pr-10 ${
                            errors.password
                              ? "border-red-400 focus:border-red-400"
                              : ""
                          }`}
                          required
                          disabled={isRegisterLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-nutrition-green transition-colors"
                          disabled={isRegisterLoading}
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field - Only for Sign Up */}
                    <div
                      className={`space-y-2 transition-all duration-300 overflow-hidden ${
                        isSignUp ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <Label
                        htmlFor="confirmPassword"
                        className="text-gray-700 font-medium"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 pr-10 ${
                            errors.confirmPassword
                              ? "border-red-400 focus:border-red-400"
                              : ""
                          }`}
                          required={isSignUp}
                          disabled={isRegisterLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-nutrition-green transition-colors"
                          disabled={isRegisterLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Remember Me / Terms - Different for login vs signup */}
                    <div className="flex items-center justify-between text-sm">
                      {isSignUp ? (
                        <label className="flex items-center space-x-2 text-gray-700">
                          <input
                            type="checkbox"
                            className="rounded border-white/30 text-nutrition-green focus:ring-nutrition-green"
                            required
                            disabled={isRegisterLoading}
                          />
                          <span>I agree to the Terms & Privacy Policy</span>
                        </label>
                      ) : (
                        <>
                          <label className="flex items-center space-x-2 text-gray-700">
                            <input
                              type="checkbox"
                              className="rounded border-white/30 text-nutrition-green focus:ring-nutrition-green"
                              disabled={isRegisterLoading}
                            />
                            <span>Remember me</span>
                          </label>
                          <a
                            href="#"
                            className="text-nutrition-green hover:text-nutrition-emerald transition-colors font-medium"
                          >
                            Forgot password?
                          </a>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700 font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      maxLength={6}
                      className={`backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30  transition-all duration-300 placeholder:text-gray-500 ${
                        errors.otp ? "border-red-400 focus:border-red-400" : ""
                      }`}
                      required
                      disabled={isVerifyLoginLoading}
                    />
                    {errors.otp && (
                      <p className="text-sm text-red-600">{errors.otp}</p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-nutrition-green to-nutrition-emerald hover:from-nutrition-emerald hover:to-nutrition-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={
                    isRegisterLoading || isLoginLoading || isVerifyLoginLoading
                  }
                >
                  {isRegisterLoading ||
                  isLoginLoading ||
                  isVerifyLoginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp
                        ? "Creating Account..."
                        : showLoginOtp
                        ? "Verifying..."
                        : "Signing In..."}
                    </>
                  ) : (
                    <>
                      {isSignUp
                        ? "Create Account"
                        : showLoginOtp
                        ? "Verify Code"
                        : "Sign In"}
                    </>
                  )}
                </Button>
              </form>

              <div className="relative">
                <Separator className="bg-white/20" />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm px-3 text-sm text-gray-600">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-white/10 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
                  className="backdrop-blur-sm bg-white/10 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  <Apple className="w-5 h-5 mr-2" />
                  Apple
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-nutrition-green hover:text-nutrition-emerald transition-colors font-medium underline"
                >
                  {isSignUp ? "Sign in" : "Sign up for free"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Feature highlights */}
          <div className="mt-8 space-y-4">
            {/* Chat Demo Button */}
            <div className="text-center">
              <Button
                onClick={() => navigate("/chat")}
                className="backdrop-blur-sm bg-nutrition-green/20 border-nutrition-green/30 hover:bg-nutrition-green/30 transition-all duration-300 text-nutrition-green hover:text-white"
                variant="outline"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Try Chat Interface Demo
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Experience our AI-powered chat system
              </p>
            </div>

            {/* Original Feature Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
                <Leaf className="w-6 h-6 text-nutrition-green mx-auto mb-2" />
                <p className="text-xs text-gray-700 font-medium">
                  Track Nutrition
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
                <Heart className="w-6 h-6 text-nutrition-emerald mx-auto mb-2" />
                <p className="text-xs text-gray-700 font-medium">
                  Health Goals
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
                <Apple className="w-6 h-6 text-nutrition-lime mx-auto mb-2" />
                <p className="text-xs text-gray-700 font-medium">
                  Smart Insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
