import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Grid } from '@/components/ui/grid';
import { dishesApi, DishListResponse, DishResponse, DishFilterParams } from '@/lib/api';
import DishComponent from '@/components/DishComponent';
import DishCreateComponent from '@/components/DishCreateComponent';
import { toast } from 'sonner';

const Dishes: React.FC = () => {
    const [dishes, setDishes] = useState<DishResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<DishFilterParams>({
        search: '',
        cuisine: '',
        has_image: undefined,
        min_prep_time: undefined,
        max_prep_time: undefined,
        min_cook_time: undefined,
        max_cook_time: undefined,
        min_servings: undefined,
        max_servings: undefined,
        min_calories: undefined,
        max_calories: undefined,
        min_protein: undefined,
        max_protein: undefined,
        min_carbs: undefined,
        max_carbs: undefined,
        min_fats: undefined,
        max_fats: undefined,
        min_sugar: undefined,
        max_sugar: undefined,
    });

    // Common cuisines for filter dropdown
    const commonCuisines = [
        'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese',
        'Thai', 'French', 'Mediterranean', 'American', 'Korean'
    ];

    // Load dishes on component mount
    useEffect(() => {
        loadDishes();
    }, []);

    const loadDishes = async (page = 1, useFilters = false) => {
        setIsLoading(true);
        try {
            let response: DishListResponse;
            
            if (useFilters || hasActiveFilters()) {
                response = await dishesApi.filter(filters, page, 20);
            } else {
                response = await dishesApi.search(filters.search || undefined, page, 20);
            }
            
            // Load full dish details for each dish
            const fullDishes: DishResponse[] = [];
            for (const dishItem of response.dishes) {
                try {
                    const fullDish = await dishesApi.getById(dishItem.id);
                    fullDishes.push(fullDish);
                } catch (error) {
                    console.error(`Error loading dish ${dishItem.id}:`, error);
                    // If loading full dish fails, create a basic DishResponse from DishListItem
                    const basicDish: DishResponse = {
                        id: dishItem.id,
                        name: dishItem.name,
                        description: dishItem.description,
                        cuisine: dishItem.cuisine,
                        prep_time_minutes: dishItem.prep_time_minutes,
                        cook_time_minutes: dishItem.cook_time_minutes,
                        servings: dishItem.servings,
                        image_urls: dishItem.image_urls,
                        created_by_user_id: dishItem.created_by_user_id,
                        created_at: dishItem.created_at,
                        updated_at: dishItem.created_at, // fallback
                        calories: dishItem.calories,
                        protein_g: dishItem.protein_g,
                        carbs_g: dishItem.carbs_g,
                        fats_g: dishItem.fats_g,
                    };
                    fullDishes.push(basicDish);
                }
            }
            
            if (page === 1) {
                setDishes(fullDishes);
            } else {
                setDishes(prev => [...prev, ...fullDishes]);
            }
            
            setTotalCount(response.total_count);
            setCurrentPage(response.page);
            setTotalPages(response.total_pages);
        } catch (error) {
            console.error('Error loading dishes:', error);
            toast.error('Failed to load dishes');
        } finally {
            setIsLoading(false);
        }
    };

    const hasActiveFilters = () => {
        return Object.entries(filters).some(([key, value]) => {
            if (key === 'search') return value && value.trim() !== '';
            return value !== undefined && value !== null && value !== '';
        });
    };

    const handleApplyFilters = () => {
        loadDishes(1, true);
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            cuisine: '',
            has_image: undefined,
            min_prep_time: undefined,
            max_prep_time: undefined,
            min_cook_time: undefined,
            max_cook_time: undefined,
            min_servings: undefined,
            max_servings: undefined,
            min_calories: undefined,
            max_calories: undefined,
            min_protein: undefined,
            max_protein: undefined,
            min_carbs: undefined,
            max_carbs: undefined,
            min_fats: undefined,
            max_fats: undefined,
            min_sugar: undefined,
            max_sugar: undefined,
        });
        // Load dishes without filters
        loadDishes(1, false);
    };

    const handleFilterChange = (field: keyof DishFilterParams, value: string | number | boolean | undefined) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDishCreated = (newDish: DishResponse) => {
        setDishes(prev => [newDish, ...prev]);
        setTotalCount(prev => prev + 1);
        setShowCreateForm(false);
    };

    const handleDishUpdated = (updatedDish: DishResponse) => {
        setDishes(prev => prev.map(dish => 
            dish.id === updatedDish.id ? updatedDish : dish
        ));
    };

    const handleDishDeleted = (dishId: number) => {
        setDishes(prev => prev.filter(dish => dish.id !== dishId));
        setTotalCount(prev => prev - 1);
    };

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            loadDishes(currentPage + 1, hasActiveFilters());
        }
    };

    return (
        <Box style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Card */}
            <Card style={{ marginBottom: '2rem' }}>
                <CardHeader>
                    <CardTitle>Dishes</CardTitle>
                    <CardDescription>
                        Browse, filter, and manage dishes. Create new dishes or edit existing ones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <VStack spacing={1} alignItems="stretch">
                        {/* Action Buttons */}
                        <HStack spacing={0.5}>
                            <Button 
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                variant={showCreateForm ? "outline" : "default"}
                            >
                                {showCreateForm ? 'Hide Create Form' : 'Create New Dish'}
                            </Button>
                            <Button 
                                onClick={() => setShowFilters(!showFilters)}
                                variant={showFilters ? "outline" : "default"}
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        </HStack>

                        {/* Quick Search */}
                        <HStack spacing={0.5}>
                            <Input
                                placeholder="Quick search by name, description, or cuisine..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <Button onClick={handleApplyFilters} disabled={isLoading}>
                                {isLoading ? 'Searching...' : 'Search'}
                            </Button>
                            {hasActiveFilters() && (
                                <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
                                    Clear All
                                </Button>
                            )}
                        </HStack>

                        {/* Results Summary */}
                        <Box style={{ marginTop: '1rem' }}>
                            <p style={{ color: '#666', fontSize: '0.875rem' }}>
                                {totalCount > 0 
                                    ? `Found ${totalCount} dish${totalCount === 1 ? '' : 'es'}${hasActiveFilters() ? ' with current filters' : ''}`
                                    : hasActiveFilters() 
                                        ? 'No dishes match your filters'
                                        : 'No dishes available'
                                }
                            </p>
                        </Box>
                    </VStack>
                </CardContent>
            </Card>

            {/* Create Form */}
            {showCreateForm && (
                <Box style={{ marginBottom: '2rem' }}>
                    <DishCreateComponent 
                        onDishCreated={handleDishCreated}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </Box>
            )}

            {/* Advanced Filters */}
            {showFilters && (
                <Card style={{ marginBottom: '2rem' }}>
                    <CardHeader>
                        <CardTitle>Advanced Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <VStack spacing={1} alignItems="stretch">
                            {/* Cuisine and Image Filter */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cuisine:</p>
                                    <select
                                        value={filters.cuisine || ''}
                                        onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="">Any cuisine</option>
                                        {commonCuisines.map(cuisine => (
                                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                                        ))}
                                    </select>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Has Image:</p>
                                    <select
                                        value={filters.has_image === undefined ? '' : filters.has_image.toString()}
                                        onChange={(e) => handleFilterChange('has_image', e.target.value === '' ? undefined : e.target.value === 'true')}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '6px',
                                            backgroundColor: 'white'
                                        }}
                                    >
                                        <option value="">Any</option>
                                        <option value="true">Has Image</option>
                                        <option value="false">No Image</option>
                                    </select>
                                </Box>
                            </HStack>

                            {/* Time Filters */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Prep Time (min):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_prep_time?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_prep_time', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_prep_time?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_prep_time', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Cook Time (min):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_cook_time?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_cook_time', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_cook_time?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_cook_time', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                            </HStack>

                            {/* Servings and Calories */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Servings:</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_servings?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_servings', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_servings?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_servings', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Calories:</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_calories?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_calories', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_calories?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_calories', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                            </HStack>

                            {/* Macronutrients */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Protein (g):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_protein?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_protein', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_protein?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_protein', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Carbs (g):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_carbs?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_carbs', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_carbs?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_carbs', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                            </HStack>

                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Fats (g):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_fats?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_fats', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_fats?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_fats', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Sugar (g):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_sugar?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_sugar', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_sugar?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_sugar', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                            </HStack>

                            {/* Filter Actions */}
                            <HStack spacing={1} style={{ marginTop: '1rem' }}>
                                <Button onClick={handleApplyFilters} disabled={isLoading}>
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={handleClearFilters} disabled={isLoading}>
                                    Clear All Filters
                                </Button>
                            </HStack>
                        </VStack>
                    </CardContent>
                </Card>
            )}

            {/* Dishes Grid */}
            {dishes.length > 0 && (
                <Grid 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    {dishes.map(dish => (
                        <DishComponent 
                            key={dish.id} 
                            dish={dish}
                            onDishUpdated={handleDishUpdated}
                            onDishDeleted={handleDishDeleted}
                        />
                    ))}
                </Grid>
            )}

            {/* Load More Button */}
            {dishes.length > 0 && currentPage < totalPages && (
                <Box style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Button onClick={handleLoadMore} disabled={isLoading}>
                        {isLoading ? 'Loading...' : `Load More (Page ${currentPage + 1} of ${totalPages})`}
                    </Button>
                </Box>
            )}

            {/* Empty State */}
            {dishes.length === 0 && !isLoading && (
                <Card>
                    <CardContent style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                            {hasActiveFilters() ? 'No dishes found matching your criteria.' : 'No dishes available.'}
                        </p>
                        {hasActiveFilters() ? (
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => setShowCreateForm(true)}>
                                Create Your First Dish
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default Dishes; 