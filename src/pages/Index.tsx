
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Apple, Leaf, Heart } from 'lucide-react';

const Index = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      console.log('Signup attempt:', { fullName, email, password, confirmPassword });
    } else {
      console.log('Login attempt:', { email, password });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    // Reset form fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-nutrition-green/20 via-nutrition-emerald/10 to-nutrition-lime/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-nutrition-orange/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-nutrition-lime/30 rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-nutrition-emerald/15 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-nutrition-amber/25 rounded-full blur-xl animate-float" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Space for animations */}
        <div className="flex-1 flex items-center justify-center p-4">
          {/* This space is reserved for your animations */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-nutrition-green to-nutrition-emerald rounded-full mb-6 shadow-lg">
              <Apple className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent mb-4">
              NutriLife
            </h1>
            <p className="text-gray-600 text-lg">Your personal nutrition companion</p>
          </div>
        </div>

        {/* Right side - Login/Signup Form */}
        <div className="w-full max-w-md p-4 flex flex-col justify-center">
          {/* Glass Login/Signup Card */}
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl shadow-black/10 relative overflow-hidden transition-all duration-500 ease-in-out">
            {/* Glass shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-glass-shimmer"></div>
            
            <CardHeader className="space-y-1 text-center relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-800 transition-all duration-300">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-gray-600 transition-all duration-300">
                {isSignUp ? 'Join us to start your nutrition journey' : 'Sign in to track your nutrition journey'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name Field - Only for Sign Up */}
                <div className={`space-y-2 transition-all duration-300 overflow-hidden ${
                  isSignUp ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30 focus:border-nutrition-green transition-all duration-300 placeholder:text-gray-500"
                    required={isSignUp}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30 focus:border-nutrition-green transition-all duration-300 placeholder:text-gray-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30 focus:border-nutrition-green transition-all duration-300 placeholder:text-gray-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-nutrition-green transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field - Only for Sign Up */}
                <div className={`space-y-2 transition-all duration-300 overflow-hidden ${
                  isSignUp ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="backdrop-blur-sm bg-white/20 border-white/30 focus:bg-white/30 focus:border-nutrition-green transition-all duration-300 placeholder:text-gray-500 pr-10"
                      required={isSignUp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-nutrition-green transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me / Terms - Different for login vs signup */}
                <div className="flex items-center justify-between text-sm">
                  {isSignUp ? (
                    <label className="flex items-center space-x-2 text-gray-700">
                      <input type="checkbox" className="rounded border-white/30 text-nutrition-green focus:ring-nutrition-green" required />
                      <span>I agree to the Terms & Privacy Policy</span>
                    </label>
                  ) : (
                    <>
                      <label className="flex items-center space-x-2 text-gray-700">
                        <input type="checkbox" className="rounded border-white/30 text-nutrition-green focus:ring-nutrition-green" />
                        <span>Remember me</span>
                      </label>
                      <a href="#" className="text-nutrition-green hover:text-nutrition-emerald transition-colors font-medium">
                        Forgot password?
                      </a>
                    </>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-nutrition-green to-nutrition-emerald hover:from-nutrition-emerald hover:to-nutrition-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <Separator className="bg-white/20" />
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm px-3 text-sm text-gray-600">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="backdrop-blur-sm bg-white/10 border-white/30 hover:bg-white/20 transition-all duration-300">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                
                <Button variant="outline" className="backdrop-blur-sm bg-white/10 border-white/30 hover:bg-white/20 transition-all duration-300">
                  <Apple className="w-5 h-5 mr-2" />
                  Apple
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button 
                  onClick={toggleMode}
                  className="text-nutrition-green hover:text-nutrition-emerald transition-colors font-medium underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up for free'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <Leaf className="w-6 h-6 text-nutrition-green mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-medium">Track Nutrition</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <Heart className="w-6 h-6 text-nutrition-emerald mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-medium">Health Goals</p>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
              <Apple className="w-6 h-6 text-nutrition-lime mx-auto mb-2" />
              <p className="text-xs text-gray-700 font-medium">Smart Insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
