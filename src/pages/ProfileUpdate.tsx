import { useEffect, useState } from "react";
import { profileApi, UserProfile, UpdateUserProfileRequest } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function ProfileUpdate() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UpdateUserProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    profileApi.getMe()
      .then((data) => {
        setProfile(data);
        setForm({ ...data });
      })
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileApi.updateMe(form);
      setSuccess(true);
      setTimeout(() => navigate("/profile"), 1000);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container py-8"><Skeleton className="h-64 w-full" /></div>;
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
          Update Profile
        </h1>
        <p className="text-green-700/80 font-medium">Keep your information up to date</p>
      </div>
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-400/30 to-emerald-500/30 backdrop-blur-sm border-2 border-green-500/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/10 to-transparent animate-glass-shimmer pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-900 drop-shadow-sm">Edit Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input name="first_name" value={form.first_name || ""} onChange={handleChange} placeholder="First Name" />
              <Input name="last_name" value={form.last_name || ""} onChange={handleChange} placeholder="Last Name" />
              <Input name="gender" value={form.gender || ""} onChange={handleChange} placeholder="Gender" />
              <Input name="height_cm" value={form.height_cm || ""} onChange={handleChange} placeholder="Height (cm)" />
              <Input name="weight_kg" value={form.weight_kg || ""} onChange={handleChange} placeholder="Weight (kg)" />
              <Input name="date_of_birth" value={form.date_of_birth || ""} onChange={handleChange} placeholder="Date of Birth" type="date" />
              <Input name="location_city" value={form.location_city || ""} onChange={handleChange} placeholder="City" />
              <Input name="location_country" value={form.location_country || ""} onChange={handleChange} placeholder="Country" />
            </div>
            <Textarea name="bio" value={form.bio || ""} onChange={handleChange} placeholder="Bio" />
            <div className="flex justify-center gap-4 mt-6">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-2 text-lg font-bold shadow-md border-green-500 text-green-700 hover:bg-green-50 transition-all" 
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
              <Button 
                size="lg" 
                className="px-8 py-2 text-lg font-bold shadow-md bg-gradient-to-r from-nutrition-green to-nutrition-emerald text-white hover:scale-105 transition-transform" 
                type="submit" 
                disabled={saving}
              >
                {saving ? "Saving..." : "Update"}
              </Button>
            </div>
            {success && <div className="text-green-600 text-center">Profile updated!</div>}
            {error && <div className="text-red-600 text-center">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 