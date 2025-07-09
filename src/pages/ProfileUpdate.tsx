import { useEffect, useState, useRef } from "react";
import { profileApi, UserProfile, UpdateUserProfileRequest } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Camera, 
  Plus, 
  X, 
  Save, 
  ArrowLeft, 
  Upload, 
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface ArrayFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  colorClass: string;
}

const ArrayField = ({ label, values, onChange, placeholder, colorClass }: ArrayFieldProps) => {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim() && !values.includes(newItem.trim())) {
      onChange([...values, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-green-800">{label}</Label>
      
      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addItem}
          size="sm"
          variant="outline"
          className="px-3"
          disabled={!newItem.trim() || values.includes(newItem.trim())}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Current items */}
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {values.length > 0 ? (
          values.map((item, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`${colorClass} pr-1 flex items-center gap-1`}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="hover:bg-red-100 rounded-full p-0.5 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No items added yet</span>
        )}
      </div>
    </div>
  );
};

export default function ProfileUpdate() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UpdateUserProfileRequest>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileApi.getMe()
      .then((data) => {
        setProfile(data);
        setForm({ 
          ...data,
          dietary_restrictions: data.dietary_restrictions || [],
          allergies: data.allergies || [],
          medical_conditions: data.medical_conditions || [],
          fitness_goals: data.fitness_goals || [],
          taste_preferences: data.taste_preferences || [],
          cuisine_interests: data.cuisine_interests || [],
        });
      })
      .catch((e) => setError(e.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: string, values: string[]) => {
    setForm((prev) => ({ ...prev, [field]: values }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploadingImage(true);
    try {
      const response = await profileApi.uploadProfilePicture(file);
      setForm((prev) => ({ ...prev, profile_image_url: response.profile_image_url }));
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileApi.updateMe(form);
      setSuccess(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setError(error.message || "Failed to update profile");
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 pb-24 max-w-4xl mx-auto">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container py-8 text-red-600 flex items-center gap-2 justify-center">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container py-8 pb-24 max-w-4xl mx-auto space-y-8 relative z-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent drop-shadow-md">
            Update Profile
          </h1>
          <p className="text-green-700/80 font-medium">Keep your information up to date</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture Section */}
        <Card className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-green-900">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-32 h-32 shadow-lg border-4 border-white bg-emerald-100">
                {form.profile_image_url && (
                  <AvatarImage src={form.profile_image_url} alt="Profile" className="object-cover" />
                )}
                <AvatarFallback className="bg-emerald-100">
                  <User className="w-16 h-16 text-emerald-500" />
                </AvatarFallback>
              </Avatar>
              
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="flex items-center gap-2"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {uploadingImage ? "Uploading..." : "Change Picture"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name || ""}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name || ""}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={form.gender || ""}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  value={form.height_cm || ""}
                  onChange={handleChange}
                  placeholder="170"
                />
              </div>
              <div>
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  value={form.weight_kg || ""}
                  onChange={handleChange}
                  placeholder="70"
                />
              </div>
              <div>
                <Label htmlFor="location_city">City</Label>
                <Input
                  id="location_city"
                  name="location_city"
                  value={form.location_city || ""}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="location_country">Country</Label>
                <Input
                  id="location_country"
                  name="location_country"
                  value={form.location_country || ""}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={form.bio || ""}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="cooking_skill_level">Cooking Skill Level</Label>
              <Select
                value={form.cooking_skill_level || ""}
                onValueChange={(value) => handleSelectChange("cooking_skill_level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Health & Dietary Information */}
        <Card className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900">Health & Dietary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArrayField
                label="Dietary Restrictions"
                values={form.dietary_restrictions || []}
                onChange={(values) => handleArrayChange("dietary_restrictions", values)}
                placeholder="e.g., Vegetarian, Vegan, Keto"
                colorClass="bg-orange-100 text-orange-700 border-orange-300"
              />
              
              <ArrayField
                label="Allergies"
                values={form.allergies || []}
                onChange={(values) => handleArrayChange("allergies", values)}
                placeholder="e.g., Nuts, Dairy, Gluten"
                colorClass="bg-red-100 text-red-700 border-red-300"
              />
              
              <ArrayField
                label="Medical Conditions"
                values={form.medical_conditions || []}
                onChange={(values) => handleArrayChange("medical_conditions", values)}
                placeholder="e.g., Diabetes, Hypertension"
                colorClass="bg-yellow-100 text-yellow-700 border-yellow-300"
              />
              
              <ArrayField
                label="Fitness Goals"
                values={form.fitness_goals || []}
                onChange={(values) => handleArrayChange("fitness_goals", values)}
                placeholder="e.g., Weight Loss, Muscle Gain"
                colorClass="bg-emerald-100 text-emerald-700 border-emerald-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900">Food Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArrayField
                label="Taste Preferences"
                values={form.taste_preferences || []}
                onChange={(values) => handleArrayChange("taste_preferences", values)}
                placeholder="e.g., Spicy, Sweet, Savory"
                colorClass="bg-lime-100 text-lime-700 border-lime-300"
              />
              
              <ArrayField
                label="Cuisine Interests"
                values={form.cuisine_interests || []}
                onChange={(values) => handleArrayChange("cuisine_interests", values)}
                placeholder="e.g., Italian, Mexican, Asian"
                colorClass="bg-cyan-100 text-cyan-700 border-cyan-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-900">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email_notifications_enabled"
                checked={form.email_notifications_enabled ?? true}
                onChange={(e) => setForm(prev => ({ ...prev, email_notifications_enabled: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="email_notifications_enabled">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="push_notifications_enabled"
                checked={form.push_notifications_enabled ?? true}
                onChange={(e) => setForm(prev => ({ ...prev, push_notifications_enabled: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="push_notifications_enabled">Push Notifications</Label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            type="button"
            size="lg" 
            variant="outline" 
            className="px-8 py-3 text-lg font-bold shadow-md border-green-500 text-green-700 hover:bg-green-50 transition-all" 
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            size="lg" 
            className="px-8 py-3 text-lg font-bold shadow-md bg-gradient-to-r from-nutrition-green to-nutrition-emerald text-white hover:scale-105 transition-transform flex items-center gap-2" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Profile
              </>
            )}
          </Button>
        </div>

        {success && (
          <div className="text-green-600 text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Profile updated successfully!
          </div>
        )}
      </form>
    </div>
  );
} 