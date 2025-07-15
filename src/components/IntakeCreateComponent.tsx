import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { intakesApi, CreateIntakeRequest, Intake, DishListResponse, Dish } from '@/lib/api';
import DishBriefComponent from './DishBriefComponent';
import { toast } from 'sonner';

interface IntakeCreateComponentProps {
    onIntakeCreated?: (newIntake: Intake) => void;
    onCancel?: () => void;
}

const IntakeCreateComponent: React.FC<IntakeCreateComponentProps> = ({ onIntakeCreated, onCancel }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDishSearching, setIsDishSearching] = useState(false);
    
    // Create state
    const [createData, setCreateData] = useState({
        dish_id: 0,
        intake_time: new Date().toISOString(),
        portion_size: '1.0',
        water_ml: 0
    });

    // Dish search state
    const [dishSearchTerm, setDishSearchTerm] = useState('');
    const [dishSearchResults, setDishSearchResults] = useState<DishListResponse | null>(null);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

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

    const handleSave = async () => {
        if (!selectedDish) {
            toast.error('Please select a dish');
            return;
        }

        setIsLoading(true);
        try {
            const intakePayload: CreateIntakeRequest = {
                dish_id: createData.dish_id,
                intake_time: createData.intake_time,
                portion_size: parseFloat(createData.portion_size),
                water_ml: createData.water_ml
            };

            const newIntake = await intakesApi.create(intakePayload);
            toast.success('Intake logged successfully');
            
            if (onIntakeCreated) {
                onIntakeCreated(newIntake);
            }
            
            // Reset form
            setCreateData({
                dish_id: 0,
                intake_time: new Date().toISOString(),
                portion_size: '1.0',
                water_ml: 0
            });
            setSelectedDish(null);
            setDishSearchTerm('');
            setDishSearchResults(null);
        } catch (error) {
            console.error('Error creating intake:', error);
            toast.error('Failed to log intake');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setCreateData({
            dish_id: 0,
            intake_time: new Date().toISOString(),
            portion_size: '1.0',
            water_ml: 0
        });
        setSelectedDish(null);
        setDishSearchTerm('');
        setDishSearchResults(null);
        
        if (onCancel) {
            onCancel();
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
        setCreateData(prev => ({ ...prev, dish_id: dish.id }));
        setDishSearchTerm(dish.name);
        setDishSearchResults(null);
    };

    const handleInputChange = (field: string, value: string | number) => {
        setCreateData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Card style={{ margin: '0.5rem 0' }}>
            <CardHeader>
                <CardTitle>
                    Log New Intake
                </CardTitle>
                <HStack spacing={1}>
                    <Button size="sm" onClick={handleSave} disabled={isLoading || !selectedDish}>
                        {isLoading ? 'Logging...' : 'Log Intake'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                </HStack>
            </CardHeader>
            <CardContent>
                <VStack spacing={1} alignItems="stretch">
                    {/* Dish Selection */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Select Dish: *</p>
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
                                    portionSize={parseFloat(createData.portion_size) || 1}
                                />
                            )}
                        </VStack>
                    </Box>

                    {/* Intake Details */}
                    <HStack spacing={1}>
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Intake Time:</p>
                            <Input
                                type="datetime-local"
                                value={formatDateTimeLocal(createData.intake_time)}
                                onChange={(e) => {
                                    const isoDate = new Date(e.target.value).toISOString();
                                    handleInputChange('intake_time', isoDate);
                                }}
                            />
                        </Box>
                        
                        <Box style={{ flex: 1 }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Portion Size:</p>
                            <Input
                                type="number"
                                step="0.1"
                                value={createData.portion_size}
                                onChange={(e) => handleInputChange('portion_size', e.target.value)}
                                placeholder="1.0"
                            />
                        </Box>
                    </HStack>

                    {/* Water Intake */}
                    <Box>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Water Intake (ml):</p>
                        <Input
                            type="number"
                            value={createData.water_ml.toString()}
                            onChange={(e) => handleInputChange('water_ml', parseInt(e.target.value) || 0)}
                            placeholder="0"
                        />
                    </Box>
                </VStack>
            </CardContent>
        </Card>
    );
};

export default IntakeCreateComponent; 