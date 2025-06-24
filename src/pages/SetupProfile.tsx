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
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  MapPin,
  Activity
} from "lucide-react";
import { toast } from "sonner";

const SetupProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromGoogleAuth = location.state?.fromGoogleAuth;
  const userInfo = location.state?.userInfo;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    location: "",
    fitnessGoals: [] as string[],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fitnessGoalOptions = [
    "Weight Loss",
    "Weight Gain",
    "Muscle Building",
    "General Health",
    "Athletic Performance",
    "Better Nutrition",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    if (!formData.height) {
      newErrors.height = "Height is required";
    }

    if (!formData.weight) {
      newErrors.weight = "Weight is required";
    }

    if (formData.fitnessGoals.length === 0) {
      newErrors.fitnessGoals = "Please select at least one fitness goal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Here you would normally call your profile update API
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Profile setup completed!", {
        description: "Welcome to BiteWise! Your profile has been created.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast.error("Profile setup failed", {
        description: "Please try again or contact support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard", {
      state: { profileIncomplete: true }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nutrition-mint to-nutrition-sage flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            {fromGoogleAuth 
              ? "Welcome to BiteWise! Let's set up your profile to get personalized nutrition recommendations."
              : "Please complete your profile to continue."}
          </CardDescription>
          {userInfo && (
            <div className="mt-2 p-2 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Signed in as {userInfo.email}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <h3 className="font-semibold">Basic Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={`${errors.firstName ? "border-red-400" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={`${errors.lastName ? "border-red-400" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className={`${errors.dateOfBirth ? "border-red-400" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className={`w-full p-2 border rounded-md ${errors.gender ? "border-red-400" : "border-gray-300"}`}
                    disabled={isLoading}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Physical Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className={`${errors.height ? "border-red-400" : ""}`}
                    disabled={isLoading}
                    placeholder="170"
                  />
                  {errors.height && (
                    <p className="text-sm text-red-600">{errors.height}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className={`${errors.weight ? "border-red-400" : ""}`}
                    disabled={isLoading}
                    placeholder="70"
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={isLoading}
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Fitness Goals */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Fitness Goals</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {fitnessGoalOptions.map((goal) => (
                  <label
                    key={goal}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.fitnessGoals.includes(goal)
                        ? "bg-nutrition-green/20 border-nutrition-green"
                        : "bg-white/10 border-white/30 hover:bg-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.fitnessGoals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                      className="rounded text-nutrition-green focus:ring-nutrition-green"
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium">{goal}</span>
                  </label>
                ))}
              </div>
              {errors.fitnessGoals && (
                <p className="text-sm text-red-600">{errors.fitnessGoals}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-nutrition-green to-nutrition-emerald hover:from-nutrition-emerald hover:to-nutrition-green"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="flex-1"
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupProfile; 