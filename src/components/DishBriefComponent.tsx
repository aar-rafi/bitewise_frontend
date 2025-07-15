import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Dish } from '@/lib/api';

interface DishBriefComponentProps {
    dish: Dish;
    portionSize?: number;
}

const DishBriefComponent: React.FC<DishBriefComponentProps> = ({ dish, portionSize = 1 }) => {
    // Calculate nutritional values based on portion size
    const calcNutrition = (value?: string | number) => {
        if (!value) return 0;
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return (numValue * portionSize).toFixed(1);
    };

    return (
        <Card style={{ 
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            margin: '0.5rem 0'
        }}>
            <CardContent style={{ padding: '0.75rem' }}>
                <VStack spacing={0.5} alignItems="stretch">
                    {/* Dish Name and Cuisine */}
                    <HStack spacing={0.5} style={{ justifyContent: 'space-between' }}>
                        <p style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            color: '#1f2937',
                            margin: 0 
                        }}>
                            {dish.name}
                        </p>
                        {dish.cuisine && (
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontStyle: 'italic',
                                backgroundColor: '#e5e7eb',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem'
                            }}>
                                {dish.cuisine}
                            </span>
                        )}
                    </HStack>

                    {/* Description */}
                    {dish.description && (
                        <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280',
                            margin: 0,
                            lineHeight: '1.25rem'
                        }}>
                            {dish.description}
                        </p>
                    )}

                    {/* Nutritional Summary */}
                    <Box style={{ marginTop: '0.5rem' }}>
                        <HStack spacing={1} style={{ flexWrap: 'wrap' }}>
                            {dish.calories && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#dc2626',
                                    fontWeight: 'bold',
                                    backgroundColor: '#fef2f2',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #fecaca'
                                }}>
                                    {calcNutrition(dish.calories)} cal
                                </span>
                            )}
                            {dish.protein_g && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#0891b2',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f0f9ff',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #bae6fd'
                                }}>
                                    P: {calcNutrition(dish.protein_g)}g
                                </span>
                            )}
                            {dish.carbs_g && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#ea580c',
                                    fontWeight: 'bold',
                                    backgroundColor: '#fff7ed',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #fed7aa'
                                }}>
                                    C: {calcNutrition(dish.carbs_g)}g
                                </span>
                            )}
                            {dish.fats_g && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#7c3aed',
                                    fontWeight: 'bold',
                                    backgroundColor: '#faf5ff',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #ddd6fe'
                                }}>
                                    F: {calcNutrition(dish.fats_g)}g
                                </span>
                            )}
                        </HStack>
                    </Box>

                    {/* Portion info if not 1 */}
                    {portionSize !== 1 && (
                        <p style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            margin: 0,
                            marginTop: '0.25rem'
                        }}>
                            Values shown for {portionSize}x portion
                        </p>
                    )}
                </VStack>
            </CardContent>
        </Card>
    );
};

export default DishBriefComponent; 