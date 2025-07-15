import React, { useState } from 'react';
import { usersApi, UserItem, UpdateUserProfileRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UserComponentProps {
    user: UserItem;
    onUserUpdated: (updatedUser: UserItem) => void;
    onUserDeleted: (deletedUserId: number) => void;
}

export const UserComponent: React.FC<UserComponentProps> = ({
    user,
    onUserUpdated,
    onUserDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<UpdateUserProfileRequest>>({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        gender: user.gender || '',
        height_cm: user.height_cm || '',
        weight_kg: user.weight_kg || '',
        date_of_birth: user.date_of_birth || '',
        location_city: user.location_city || '',
        location_country: user.location_country || '',
        cooking_skill_level: user.cooking_skill_level || '',
        email_notifications_enabled: true,
        push_notifications_enabled: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            gender: user.gender || '',
            height_cm: user.height_cm || '',
            weight_kg: user.weight_kg || '',
            date_of_birth: user.date_of_birth || '',
            location_city: user.location_city || '',
            location_country: user.location_country || '',
            cooking_skill_level: user.cooking_skill_level || '',
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            gender: user.gender || '',
            height_cm: user.height_cm || '',
            weight_kg: user.weight_kg || '',
            date_of_birth: user.date_of_birth || '',
            location_city: user.location_city || '',
            location_country: user.location_country || '',
            cooking_skill_level: user.cooking_skill_level || '',
        });
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const updatedUser = await usersApi.update(user.id, editData);
            onUserUpdated(updatedUser);
            setIsEditing(false);
            toast.success('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await usersApi.delete(user.id);
            onUserDeleted(user.id);
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleString();
    };

    const formatDateInput = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const getUserStatusBadges = () => {
        const badges = [];
        if (user.is_active) badges.push(<Badge key="active" className="bg-green-100 text-green-800">Active</Badge>);
        if (user.is_verified) badges.push(<Badge key="verified" className="bg-blue-100 text-blue-800">Verified</Badge>);
        if (user.is_superuser) badges.push(<Badge key="admin" className="bg-purple-100 text-purple-800">Admin</Badge>);
        if (user.oauth_provider) badges.push(<Badge key="oauth" variant="outline">{user.oauth_provider}</Badge>);
        return badges;
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-lg">
                            <span 
                                onClick={() => window.location.href = `/users/${user.id}`}
                                style={{ 
                                    cursor: 'pointer', 
                                    color: '#2563eb', 
                                    textDecoration: 'underline' 
                                }}
                            >
                                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username} (ID: {user.id})
                            </span>
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            {getUserStatusBadges()}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleEdit}>
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">First Name</label>
                                <Input
                                    value={editData.first_name || ''}
                                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                                    placeholder="First name..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Last Name</label>
                                <Input
                                    value={editData.last_name || ''}
                                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                                    placeholder="Last name..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Gender</label>
                                <Select 
                                    value={editData.gender || 'not_specified'} 
                                    onValueChange={(value) => setEditData({ ...editData, gender: value === 'not_specified' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_specified">Not specified</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Height (cm)</label>
                                <Input
                                    value={editData.height_cm || ''}
                                    onChange={(e) => setEditData({ ...editData, height_cm: e.target.value })}
                                    placeholder="Height..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Weight (kg)</label>
                                <Input
                                    value={editData.weight_kg || ''}
                                    onChange={(e) => setEditData({ ...editData, weight_kg: e.target.value })}
                                    placeholder="Weight..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Date of Birth</label>
                                <Input
                                    type="date"
                                    value={formatDateInput(editData.date_of_birth)}
                                    onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Cooking Skill Level</label>
                                <Select 
                                    value={editData.cooking_skill_level || 'not_specified'} 
                                    onValueChange={(value) => setEditData({ ...editData, cooking_skill_level: value === 'not_specified' ? '' : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select skill level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_specified">Not specified</SelectItem>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">City</label>
                                <Input
                                    value={editData.location_city || ''}
                                    onChange={(e) => setEditData({ ...editData, location_city: e.target.value })}
                                    placeholder="City..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Country</label>
                                <Input
                                    value={editData.location_country || ''}
                                    onChange={(e) => setEditData({ ...editData, location_country: e.target.value })}
                                    placeholder="Country..."
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Email:</strong> {user.email}
                            </div>
                            <div>
                                <strong>Username:</strong> {user.username}
                            </div>
                            <div>
                                <strong>First Name:</strong> {user.first_name || 'Not set'}
                            </div>
                            <div>
                                <strong>Last Name:</strong> {user.last_name || 'Not set'}
                            </div>
                            <div>
                                <strong>Gender:</strong> {user.gender || 'Not set'}
                            </div>
                            <div>
                                <strong>Date of Birth:</strong> {user.date_of_birth || 'Not set'}
                            </div>
                            <div>
                                <strong>Height:</strong> {user.height_cm ? `${user.height_cm} cm` : 'Not set'}
                            </div>
                            <div>
                                <strong>Weight:</strong> {user.weight_kg ? `${user.weight_kg} kg` : 'Not set'}
                            </div>
                            <div>
                                <strong>Location:</strong> {user.location_city || user.location_country 
                                    ? `${user.location_city || ''} ${user.location_country || ''}`.trim() 
                                    : 'Not set'}
                            </div>
                            <div>
                                <strong>Cooking Skill:</strong> {user.cooking_skill_level || 'Not set'}
                            </div>
                        </div>

                        {(user.dietary_restrictions?.length || user.allergies?.length || 
                          user.medical_conditions?.length || user.fitness_goals?.length || 
                          user.taste_preferences?.length || user.cuisine_interests?.length) && (
                            <div className="space-y-2">
                                {user.dietary_restrictions?.length && (
                                    <div>
                                        <strong>Dietary Restrictions:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.dietary_restrictions.map((restriction, idx) => (
                                                <Badge key={idx} variant="outline">{restriction}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {user.allergies?.length && (
                                    <div>
                                        <strong>Allergies:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.allergies.map((allergy, idx) => (
                                                <Badge key={idx} variant="outline">{allergy}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {user.medical_conditions?.length && (
                                    <div>
                                        <strong>Medical Conditions:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.medical_conditions.map((condition, idx) => (
                                                <Badge key={idx} variant="outline">{condition}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {user.fitness_goals?.length && (
                                    <div>
                                        <strong>Fitness Goals:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.fitness_goals.map((goal, idx) => (
                                                <Badge key={idx} variant="outline">{goal}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {user.taste_preferences?.length && (
                                    <div>
                                        <strong>Taste Preferences:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.taste_preferences.map((pref, idx) => (
                                                <Badge key={idx} variant="outline">{pref}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {user.cuisine_interests?.length && (
                                    <div>
                                        <strong>Cuisine Interests:</strong>
                                        <div className="flex gap-1 flex-wrap mt-1">
                                            {user.cuisine_interests.map((cuisine, idx) => (
                                                <Badge key={idx} variant="outline">{cuisine}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-sm text-gray-600">
                            <div><strong>Created:</strong> {formatDate(user.created_at)}</div>
                            <div><strong>Updated:</strong> {formatDate(user.updated_at)}</div>
                            {user.last_login_at && (
                                <div><strong>Last Login:</strong> {formatDate(user.last_login_at)}</div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            {isEditing && (
                <CardFooter className="gap-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}; 