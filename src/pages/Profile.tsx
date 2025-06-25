import { useEffect, useState } from "react";
import { profileApi, UserProfile } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Mail, Cake, Ruler, Weight, Globe, Sparkles, Bell, BellOff } from "lucide-react";
import { useTokenHandler } from "@/hooks/useTokenHandler";
import NutritionLoadingAnimation from "@/components/NutritionLoadingAnimation";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenProcessing, setShowTokenProcessing] = useState(false);
  const navigate = useNavigate();

  // Handle OAuth tokens if present in URL
  const { isProcessingTokens } = useTokenHandler({
    onProcessingStart: () => {
      setShowTokenProcessing(true);
    },
    onProcessingEnd: () => {
      setShowTokenProcessing(false);
    },
  });

  useEffect(() => {
    profileApi.getMe()
      .then(setProfile)
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  // Show loading animation during token processing
  if (showTokenProcessing || isProcessingTokens) {
    return (
      <NutritionLoadingAnimation 
        message="Processing authentication..."
        showProgress={false}
      />
    );
  }

  if (loading) {
    return (
      <NutritionLoadingAnimation 
        message="Loading your profile..."
        showProgress={false}
      />
    );
  }
  if (error) {
    return <div className="container py-8 text-red-600">{error}</div>;
  }
  if (!profile) return null;

  return (
    <div className="container py-8 pb-24 max-w-2xl mx-auto space-y-8 relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent drop-shadow-md">
          My Profile
        </h1>
        <p className="text-green-700/80 font-medium">Personalize your experience</p>
      </div>

      {/* Profile Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-400/30 to-emerald-500/30 backdrop-blur-sm border-2 border-green-500/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/10 to-transparent animate-glass-shimmer pointer-events-none" />
        <CardHeader className="flex flex-col items-center justify-center gap-2 pb-0">
            <Avatar className="w-24 h-24 shadow-lg border-4 border-white bg-emerald-100">
              {profile.profile_image_url && (
                <AvatarImage src={profile.profile_image_url} alt="Profile" className="object-cover" />
              )}
              <AvatarFallback className="bg-emerald-100">
                <User className="w-16 h-16 text-emerald-500" />
              </AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl font-bold text-green-900 drop-shadow-sm mt-2">
            {profile.first_name} {profile.last_name}
          </CardTitle>
          <span className="flex items-center gap-1 text-green-700/80 font-medium">
            <Mail className="w-4 h-4" /> ID: {profile.user_id}
          </span>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-green-900"><Cake className="w-4 h-4" /> {profile.date_of_birth}</div>
            <div className="flex items-center gap-2 text-green-900"><Ruler className="w-4 h-4" /> {profile.height_cm} cm</div>
            <div className="flex items-center gap-2 text-green-900"><Weight className="w-4 h-4" /> {profile.weight_kg} kg</div>
            <div className="flex items-center gap-2 text-green-900"><Globe className="w-4 h-4" /> {profile.location_city}, {profile.location_country}</div>
            <div className="flex items-center gap-2 text-green-900"><Sparkles className="w-4 h-4" /> {profile.cooking_skill_level.charAt(0).toUpperCase() + profile.cooking_skill_level.slice(1)}</div>
            <div className="flex items-center gap-2 text-green-900"><MapPin className="w-4 h-4" /> {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}</div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="bg-emerald-50/80 rounded-lg p-3 text-green-900 shadow-inner border border-emerald-200">
              <span className="font-semibold">Bio:</span> {profile.bio}
            </div>
          )}

          {/* Preferences & Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold text-green-800 mb-1">Dietary Restrictions</div>
              <div className="flex flex-wrap gap-1">
                {profile.dietary_restrictions?.length ? profile.dietary_restrictions.map((d, i) => (
                  <Badge key={i} variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">{d}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-800 mb-1">Allergies</div>
              <div className="flex flex-wrap gap-1">
                {profile.allergies?.length ? profile.allergies.map((a, i) => (
                  <Badge key={i} variant="outline" className="bg-rose-100 text-rose-700 border-rose-300">{a}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-800 mb-1">Medical Conditions</div>
              <div className="flex flex-wrap gap-1">
                {profile.medical_conditions.length ? profile.medical_conditions.map((m, i) => (
                  <Badge key={i} variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">{m}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-800 mb-1">Fitness Goals</div>
              <div className="flex flex-wrap gap-1">
                {profile.fitness_goals.length ? profile.fitness_goals.map((f, i) => (
                  <Badge key={i} variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">{f}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-800 mb-1">Taste Preferences</div>
              <div className="flex flex-wrap gap-1">
                {profile.taste_preferences.length ? profile.taste_preferences.map((t, i) => (
                  <Badge key={i} variant="outline" className="bg-lime-100 text-lime-700 border-lime-300">{t}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
            <div>
              <div className="font-semibold text-green-800 mb-1">Cuisine Interests</div>
              <div className="flex flex-wrap gap-1">
                {profile.cuisine_interests.length ? profile.cuisine_interests.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-cyan-100 text-cyan-700 border-cyan-300">{c}</Badge>
                )) : <span className="text-gray-400">None</span>}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex flex-wrap gap-4 items-center mt-2">
            <div className="flex items-center gap-2">
              {profile.email_notifications_enabled ? <Bell className="w-5 h-5 text-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
              <span className="text-green-900 font-medium">Email Notifications: {profile.email_notifications_enabled ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex items-center gap-2">
              {profile.push_notifications_enabled ? <Bell className="w-5 h-5 text-green-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
              <span className="text-green-900 font-medium">Push Notifications: {profile.push_notifications_enabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button size="lg" className="px-8 py-2 text-lg font-bold shadow-md bg-gradient-to-r from-nutrition-green to-nutrition-emerald text-white hover:scale-105 transition-transform" onClick={() => navigate("/profile/update")}>Update Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 