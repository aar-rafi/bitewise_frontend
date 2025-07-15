import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { dishesApi, DishCreateRequest, DishResponse } from '@/lib/api';
import { toast } from 'sonner';

interface DishCreateComponentProps {
    onDishCreated?: (newDish: DishResponse) => void;
    onCancel?: () => void;
}

const DishCreateComponent: React.FC<DishCreateComponentProps> = ({ onDishCreated, onCancel }) => {
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
    
    const [createData, setCreateData] = useState<DishCreateRequest>({
        name: '',
        description: '',
        cuisine: '',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        servings: 1,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fats_g: 0,
        fiber_g: 0,
        sugar_g: 0,
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!createData.name?.trim()) {
            toast.error('Dish name is required');
            return;
        }

        setIsLoading(true);
        try {
            const newDish = await dishesApi.create(createData);
            toast.success('Dish created successfully');
            if (onDishCreated) {
                onDishCreated(newDish);
            }
            // Reset form
            setCreateData({
                name: '',
                description: '',
                cuisine: '',
                prep_time_minutes: 0,
                cook_time_minutes: 0,
                servings: 1,
                calories: 0,
                protein_g: 0,
                carbs_g: 0,
                fats_g: 0,
                fiber_g: 0,
                sugar_g: 0,
            });
        } catch (error) {
            console.error('Error creating dish:', error);
            toast.error('Failed to create dish');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setCreateData({
            name: '',
            description: '',
            cuisine: '',
            prep_time_minutes: 0,
            cook_time_minutes: 0,
            servings: 1,
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fats_g: 0,
            fiber_g: 0,
            sugar_g: 0,
        });
        if (onCancel) {
            onCancel();
        }
    };

    const handleInputChange = (field: keyof DishCreateRequest, value: string | number) => {
        setCreateData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Card style={{ margin: '0.5rem 0' }}>
            <CardHeader>
                <CardTitle>
                    Create New Dish
                </CardTitle>
                <HStack spacing={1}>
                    <Button size="sm" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </HStack>
            </CardHeader>
            <CardContent>
                <VStack spacing={1} alignItems="stretch">
                    {/* Dish Name */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Dish Name: *</p>
                        <Input
                            value={createData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter dish name"
                        />
                    </Box>

                    {/* Description */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Description:</p>
                        <Input
                            value={createData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter dish description"
                        />
                    </Box>

                    {/* Cuisine */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cuisine:</p>
                        <select
                            value={createData.cuisine || ''}
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
                            {commonCuisines.map(cuisine => (
                                <option key={cuisine} value={cuisine}>
                                    {cuisine}
                                </option>
                            ))}
                        </select>
                    </Box>

                    {/* Prep and Cook Time */}
                    <HStack spacing={1}>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Prep Time (min):</p>
                            <Input
                                type="number"
                                value={createData.prep_time_minutes?.toString() || ''}
                                onChange={(e) => handleInputChange('prep_time_minutes', parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </Box>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cook Time (min):</p>
                            <Input
                                type="number"
                                value={createData.cook_time_minutes?.toString() || ''}
                                onChange={(e) => handleInputChange('cook_time_minutes', parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </Box>
                    </HStack>

                    {/* Servings */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Servings:</p>
                        <Input
                            type="number"
                            value={createData.servings?.toString() || ''}
                            onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                            placeholder="1"
                        />
                    </Box>

                    {/* Nutritional Information */}
                    <Box style={{ marginTop: '1rem' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Nutritional Information (per serving):</p>
                        
                        {/* Calories */}
                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Calories:</p>
                                <Input
                                    type="number"
                                    value={createData.calories?.toString() || ''}
                                    onChange={(e) => handleInputChange('calories', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>

                        {/* Macronutrients */}
                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Protein (g):</p>
                                <Input
                                    type="number"
                                    value={createData.protein_g?.toString() || ''}
                                    onChange={(e) => handleInputChange('protein_g', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Carbs (g):</p>
                                <Input
                                    type="number"
                                    value={createData.carbs_g?.toString() || ''}
                                    onChange={(e) => handleInputChange('carbs_g', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Fats (g):</p>
                                <Input
                                    type="number"
                                    value={createData.fats_g?.toString() || ''}
                                    onChange={(e) => handleInputChange('fats_g', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Fiber (g):</p>
                                <Input
                                    type="number"
                                    value={createData.fiber_g?.toString() || ''}
                                    onChange={(e) => handleInputChange('fiber_g', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>

                        <Box style={{ marginBottom: '0.5rem' }}>
                            <HStack spacing={1}>
                                <p style={{ fontWeight: 'bold', minWidth: '80px' }}>Sugar (g):</p>
                                <Input
                                    type="number"
                                    value={createData.sugar_g?.toString() || ''}
                                    onChange={(e) => handleInputChange('sugar_g', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    style={{ flex: 1 }}
                                />
                            </HStack>
                        </Box>
                    </Box>
                </VStack>
            </CardContent>
        </Card>
    );
};

export default DishCreateComponent; 