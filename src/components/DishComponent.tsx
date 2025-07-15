import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { dishesApi, DishResponse, DishUpdateRequest } from '@/lib/api';
import { toast } from 'sonner';

interface DishComponentProps {
    dish: DishResponse;
    onDishUpdated?: (updatedDish: DishResponse) => void;
    onDishDeleted?: (dishId: number) => void;
}

const DishComponent: React.FC<DishComponentProps> = ({ dish, onDishUpdated, onDishDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Common cuisines list
    const commonCuisines = [
        'Italian',
        'Chinese', 
        'Mexican',
        'Indian',
        'Japanese',
        'Thai',
        'French',
        'Mediterranean',
        'American',
        'Korean'
    ];
    
    // Create cuisine options including current dish cuisine if not in common list
    const getCuisineOptions = () => {
        const options = [...commonCuisines];
        if (dish.cuisine && !commonCuisines.includes(dish.cuisine)) {
            options.push(dish.cuisine);
        }
        return options.sort();
    };
    
    const [editData, setEditData] = useState<DishUpdateRequest>({
        name: dish.name,
        description: dish.description || '',
        cuisine: dish.cuisine || '',
        prep_time_minutes: dish.prep_time_minutes || 0,
        cook_time_minutes: dish.cook_time_minutes || 0,
        servings: dish.servings || 1,
        calories: dish.calories || 0,
        protein_g: dish.protein_g || 0,
        carbs_g: dish.carbs_g || 0,
        fats_g: dish.fats_g || 0,
        fiber_g: dish.fiber_g || 0,
        sugar_g: dish.sugar_g || 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset edit data to original values
        setEditData({
            name: dish.name,
            description: dish.description || '',
            cuisine: dish.cuisine || '',
            prep_time_minutes: dish.prep_time_minutes || 0,
            cook_time_minutes: dish.cook_time_minutes || 0,
            servings: dish.servings || 1,
            calories: dish.calories || 0,
            protein_g: dish.protein_g || 0,
            carbs_g: dish.carbs_g || 0,
            fats_g: dish.fats_g || 0,
            fiber_g: dish.fiber_g || 0,
            sugar_g: dish.sugar_g || 0,
        });
    };

    const handleSave = async () => {
        if (!editData.name?.trim()) {
            toast.error('Dish name is required');
            return;
        }

        setIsLoading(true);
        try {
            const updatedDish = await dishesApi.update(dish.id, editData);
            setIsEditing(false);
            toast.success('Dish updated successfully');
            if (onDishUpdated) {
                onDishUpdated(updatedDish);
            }
        } catch (error) {
            console.error('Error updating dish:', error);
            toast.error('Failed to update dish');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this dish?')) {
            return;
        }

        setIsLoading(true);
        try {
            await dishesApi.delete(dish.id);
            toast.success('Dish deleted successfully');
            if (onDishDeleted) {
                onDishDeleted(dish.id);
            }
        } catch (error) {
            console.error('Error deleting dish:', error);
            toast.error('Failed to delete dish');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof DishUpdateRequest, value: string | number) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatNumber = (value?: number) => {
        if (value === undefined || value === null) return 'N/A';
        return value.toString();
    };

    return (
        <Card style={{ margin: '0.5rem 0' }}>
            <CardHeader>
                <CardTitle>
                    {isEditing ? (
                        <Input
                            value={editData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Dish name"
                        />
                    ) : (
                        <span 
                            onClick={() => window.location.href = `/dishes/${dish.id}`}
                            style={{ 
                                cursor: 'pointer', 
                                color: '#2563eb', 
                                textDecoration: 'underline' 
                            }}
                        >
                            {dish.name} (ID: {dish.id})
                        </span>
                    )}
                </CardTitle>
                {!isEditing && (
                    <HStack spacing={1}>
                        <Button size="sm" onClick={handleEdit} disabled={isLoading}>
                            Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            Delete
                        </Button>
                    </HStack>
                )}
                {isEditing && (
                    <HStack spacing={1}>
                        <Button size="sm" onClick={handleSave} disabled={isLoading}>
                            Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    </HStack>
                )}
            </CardHeader>
            <CardContent>
                <VStack spacing={1} alignItems="stretch">
                    {/* Display dish image if available */}
                    {dish.image_urls && dish.image_urls.length > 0 && (
                        <Box>
                            <img 
                                src={dish.image_urls[0]} 
                                alt={dish.name}
                                style={{ 
                                    width: '100%', 
                                    height: '200px', 
                                    objectFit: 'cover', 
                                    borderRadius: '8px' 
                                }}
                            />
                        </Box>
                    )}

                    {/* Description */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Description:</p>
                        {isEditing ? (
                            <Input
                                value={editData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Dish description"
                            />
                        ) : (
                            <p style={{ color: '#666' }}>{dish.description || 'No description'}</p>
                        )}
                    </Box>

                    {/* Cuisine */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cuisine:</p>
                        {isEditing ? (
                            <select
                                value={editData.cuisine || ''}
                                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Select cuisine</option>
                                {getCuisineOptions().map(cuisine => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Box style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                {dish.cuisine || 'Unknown'}
                            </Box>
                        )}
                    </Box>

                    {/* Prep and Cook Time */}
                    <HStack spacing={1}>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Prep Time:</p>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={editData.prep_time_minutes?.toString() || ''}
                                    onChange={(e) => handleInputChange('prep_time_minutes', parseInt(e.target.value) || 0)}
                                    placeholder="Minutes"
                                />
                            ) : (
                                <p>{formatNumber(dish.prep_time_minutes)} min</p>
                            )}
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cook Time:</p>
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={editData.cook_time_minutes?.toString() || ''}
                                    onChange={(e) => handleInputChange('cook_time_minutes', parseInt(e.target.value) || 0)}
                                    placeholder="Minutes"
                                />
                            ) : (
                                <p>{formatNumber(dish.cook_time_minutes)} min</p>
                            )}
                        </Box>
                    </HStack>

                    {/* Servings */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Servings:</p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editData.servings?.toString() || ''}
                                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                                placeholder="Number of servings"
                            />
                        ) : (
                            <p>{formatNumber(dish.servings)}</p>
                        )}
                    </Box>

                    {/* Nutritional Information */}
                    <Box style={{ marginTop: '1rem' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Nutritional Information (per serving):</p>
                        
                        {/* Calories */}
                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Calories:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.calories?.toString() || ''}
                                        onChange={(e) => handleInputChange('calories', parseFloat(e.target.value) || 0)}
                                        placeholder="Calories"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.calories)} kcal</p>
                                )}
                            </HStack>
                        </Box>

                        {/* Macronutrients */}
                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Protein:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.protein_g?.toString() || ''}
                                        onChange={(e) => handleInputChange('protein_g', parseFloat(e.target.value) || 0)}
                                        placeholder="Protein (g)"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.protein_g)} g</p>
                                )}
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Carbs:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.carbs_g?.toString() || ''}
                                        onChange={(e) => handleInputChange('carbs_g', parseFloat(e.target.value) || 0)}
                                        placeholder="Carbs (g)"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.carbs_g)} g</p>
                                )}
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Fats:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.fats_g?.toString() || ''}
                                        onChange={(e) => handleInputChange('fats_g', parseFloat(e.target.value) || 0)}
                                        placeholder="Fats (g)"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.fats_g)} g</p>
                                )}
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Fiber:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.fiber_g?.toString() || ''}
                                        onChange={(e) => handleInputChange('fiber_g', parseFloat(e.target.value) || 0)}
                                        placeholder="Fiber (g)"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.fiber_g)} g</p>
                                )}
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Sugar:</p>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        value={editData.sugar_g?.toString() || ''}
                                        onChange={(e) => handleInputChange('sugar_g', parseFloat(e.target.value) || 0)}
                                        placeholder="Sugar (g)"
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <p>{formatNumber(dish.sugar_g)} g</p>
                                )}
                            </HStack>
                        </Box>
                    </Box>

                    {/* Created date */}
                    <Box style={{ marginTop: '1rem', color: '#666', fontSize: '0.875rem' }}>
                        <p>Created: {new Date(dish.created_at).toLocaleDateString()}</p>
                    </Box>
                </VStack>
            </CardContent>
        </Card>
    );
};

export default DishComponent; 