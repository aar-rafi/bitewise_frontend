import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { intakesApi, dishesApi, Intake, DishListResponse, Dish } from '@/lib/api';
import DishBriefComponent from './DishBriefComponent';
import DateTimePicker from './DateTimePicker';
import { toast } from 'sonner';

interface IntakeComponentProps {
    intake: Intake;
    onIntakeUpdated?: (updatedIntake: Intake) => void;
    onIntakeDeleted?: (intakeId: number) => void;
}

const IntakeComponent: React.FC<IntakeComponentProps> = ({
    intake,
    onIntakeUpdated,
    onIntakeDeleted
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDishSearching, setIsDishSearching] = useState(false);
    
    // Edit state
    const [editData, setEditData] = useState({
        dish_id: intake.dish_id,
        intake_time: intake.intake_time,
        portion_size: intake.portion_size.toString(),
        water_ml: intake.water_ml
    });

    // Dish search state
    const [dishSearchTerm, setDishSearchTerm] = useState('');
    const [dishSearchResults, setDishSearchResults] = useState<DishListResponse | null>(null);
    const [selectedDish, setSelectedDish] = useState(intake.dish);

    // Helper to format date for datetime-local input
    const formatDateTimeLocal = (isoString: string) => {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Helper to format date for display
    const formatDisplayDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            dish_id: intake.dish_id,
            intake_time: intake.intake_time,
            portion_size: intake.portion_size.toString(),
            water_ml: intake.water_ml
        });
        setSelectedDish(intake.dish);
        setDishSearchTerm('');
        setDishSearchResults(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            dish_id: intake.dish_id,
            intake_time: intake.intake_time,
            portion_size: intake.portion_size.toString(),
            water_ml: intake.water_ml
        });
        setSelectedDish(intake.dish);
        setDishSearchTerm('');
        setDishSearchResults(null);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatePayload = {
                dish_id: editData.dish_id,
                intake_time: editData.intake_time,
                portion_size: parseFloat(editData.portion_size),
                water_ml: editData.water_ml
            };

            const updatedIntake = await intakesApi.update(intake.id, updatePayload);
            
            // Update the selected dish in the response
            const updatedIntakeWithDish = {
                ...updatedIntake,
                dish: selectedDish
            };

            if (onIntakeUpdated) {
                onIntakeUpdated(updatedIntakeWithDish);
            }
            setIsEditing(false);
            toast.success('Intake updated successfully');
        } catch (error) {
            console.error('Error updating intake:', error);
            toast.error('Failed to update intake');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this intake?')) return;
        
        setIsLoading(true);
        try {
            await intakesApi.delete(intake.id);
            if (onIntakeDeleted) {
                onIntakeDeleted(intake.id);
            }
            toast.success('Intake deleted successfully');
        } catch (error) {
            console.error('Error deleting intake:', error);
            toast.error('Failed to delete intake');
        } finally {
            setIsLoading(false);
        }
    };

    const searchDishes = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setDishSearchResults(null);
            return;
        }

        setIsDishSearching(true);
        try {
            const results = await intakesApi.searchDishes(searchTerm, 1, 10);
            setDishSearchResults(results);
        } catch (error) {
            console.error('Error searching dishes:', error);
            toast.error('Failed to search dishes');
        } finally {
            setIsDishSearching(false);
        }
    };

    const selectDish = (dishListItem: DishListResponse['dishes'][0]) => {
        // Convert DishListItem to Dish format for compatibility
        const dish: Dish = {
            id: dishListItem.id,
            name: dishListItem.name,
            description: dishListItem.description || '',
            cuisine: dishListItem.cuisine || '',
            image_urls: dishListItem.image_urls || [],
            servings: dishListItem.servings || 1,
            calories: dishListItem.calories?.toString() || '0',
            protein_g: dishListItem.protein_g?.toString() || '0',
            carbs_g: dishListItem.carbs_g?.toString() || '0',
            fats_g: dishListItem.fats_g?.toString() || '0',
            fiber_g: '0', // DishListItem doesn't have fiber_g, default to '0'
            sugar_g: '0'  // DishListItem doesn't have sugar_g, default to '0'
        };
        
        setSelectedDish(dish);
        setEditData(prev => ({ ...prev, dish_id: dish.id }));
        setDishSearchTerm(dish.name);
        setDishSearchResults(null);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Card style={{ margin: '0.5rem 0' }}>
            <CardHeader>
                <CardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                        onClick={() => window.location.href = `/intakes/${intake.id}`}
                        style={{ 
                            cursor: 'pointer', 
                            color: '#2563eb', 
                            textDecoration: 'underline' 
                        }}
                    >
                        Intake (ID: {intake.id}) - {formatDisplayDate(intake.intake_time)}
                    </span>
                    <HStack spacing={0.5}>
                        {isEditing ? (
                            <>
                                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" onClick={handleEdit}>Edit</Button>
                                <Button size="sm" variant="outline" onClick={handleDelete} disabled={isLoading}>
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            </>
                        )}
                    </HStack>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <VStack spacing={1} alignItems="stretch">
                    {/* Dish Information */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Dish:</p>
                        {isEditing ? (
                            <VStack spacing={0.5} alignItems="stretch">
                                <Input
                                    placeholder="Search for a dish..."
                                    value={dishSearchTerm}
                                    onChange={(e) => {
                                        setDishSearchTerm(e.target.value);
                                        searchDishes(e.target.value);
                                    }}
                                />
                                
                                {isDishSearching && (
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Searching...</p>
                                )}
                                
                                {dishSearchResults && dishSearchResults.dishes.length > 0 && (
                                    <Box style={{
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {dishSearchResults.dishes.map(dish => (
                                            <div
                                                key={dish.id}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderBottom: '1px solid #e5e7eb',
                                                    cursor: 'pointer',
                                                    backgroundColor: selectedDish?.id === dish.id ? '#f3f4f6' : 'white'
                                                }}
                                                onClick={() => selectDish(dish)}
                                            >
                                                <p style={{ fontWeight: 'bold', margin: 0 }}>{dish.name}</p>
                                                {dish.description && (
                                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                                                        {dish.description}
                                                    </p>
                                                )}
                                                {dish.cuisine && (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        backgroundColor: '#f3f4f6',
                                                        padding: '0.125rem 0.375rem',
                                                        borderRadius: '0.25rem',
                                                        color: '#6b7280'
                                                    }}>
                                                        {dish.cuisine}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </Box>
                                )}
                                
                                {selectedDish && (
                                    <DishBriefComponent 
                                        dish={selectedDish} 
                                        portionSize={parseFloat(editData.portion_size) || 1}
                                    />
                                )}
                            </VStack>
                        ) : (
                            <DishBriefComponent 
                                dish={intake.dish} 
                                portionSize={parseFloat(intake.portion_size.toString())}
                            />
                        )}
                    </Box>

                    {/* Intake Details */}
                    <HStack spacing={1}>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Intake Time:</p>
                            {isEditing ? (
                                <DateTimePicker
                                    value={editData.intake_time}
                                    onChange={(isoDate) => handleInputChange('intake_time', isoDate)}
                                    placeholder="Select intake time"
                                />
                            ) : (
                                <p style={{ margin: 0 }}>{formatDisplayDate(intake.intake_time)}</p>
                            )}
                        </Box>
                        
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Portion Size:</p>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={editData.portion_size}
                                    onChange={(e) => handleInputChange('portion_size', e.target.value)}
                                    placeholder="1.0"
                                />
                            ) : (
                                <p style={{ margin: 0 }}>{intake.portion_size}x</p>
                            )}
                        </Box>
                    </HStack>

                    {/* Water Intake */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Water Intake (ml):</p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.water_ml?.toString() || ''}
                                onChange={(e) => handleInputChange('water_ml', parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        ) : (
                            <p style={{ margin: 0 }}>{intake.water_ml || 0} ml</p>
                        )}
                    </Box>
                </VStack>
            </CardContent>
        </Card>
    );
};

export default IntakeComponent; 