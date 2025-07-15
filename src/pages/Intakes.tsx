import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Grid } from '@/components/ui/grid';
import { intakesApi, TodayIntakesResponse, Intake, IntakeFilterParams } from '@/lib/api';
import IntakeComponent from '@/components/IntakeComponent';
import IntakeCreateComponent from '@/components/IntakeCreateComponent';
import { toast } from 'sonner';

const Intakes: React.FC = () => {
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<IntakeFilterParams>({
        dish_search: '',
        cuisine: '',
        has_image: undefined,
        min_intake_time: undefined,
        max_intake_time: undefined,
        min_portion_size: undefined,
        max_portion_size: undefined,
        min_water_ml: undefined,
        max_water_ml: undefined,
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

    // Helper to format date for datetime-local input
    const formatDateTimeLocal = (isoString?: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Load intakes on component mount
    useEffect(() => {
        loadIntakes();
    }, []);

    const loadIntakes = async (page = 1, useFilters = false) => {
        setIsLoading(true);
        try {
            let response: TodayIntakesResponse;
            
            if (useFilters || hasActiveFilters()) {
                response = await intakesApi.filter(filters, page, 20);
            } else {
                response = await intakesApi.getAll(page, 20);
            }
            
            if (page === 1) {
                setIntakes(response.intakes);
            } else {
                setIntakes(prev => [...prev, ...response.intakes]);
            }
            
            setTotalCount(response.total_count);
            setCurrentPage(response.page);
            setTotalPages(response.total_pages);
        } catch (error) {
            console.error('Error loading intakes:', error);
            toast.error('Failed to load intakes');
        } finally {
            setIsLoading(false);
        }
    };

    const hasActiveFilters = () => {
        return Object.entries(filters).some(([key, value]) => {
            if (key === 'dish_search') return value && value.trim() !== '';
            return value !== undefined && value !== null && value !== '';
        });
    };

    const handleApplyFilters = () => {
        loadIntakes(1, true);
    };

    const handleClearFilters = () => {
        setFilters({
            dish_search: '',
            cuisine: '',
            has_image: undefined,
            min_intake_time: undefined,
            max_intake_time: undefined,
            min_portion_size: undefined,
            max_portion_size: undefined,
            min_water_ml: undefined,
            max_water_ml: undefined,
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
        // Load intakes without filters
        loadIntakes(1, false);
    };

    const handleFilterChange = (field: keyof IntakeFilterParams, value: string | number | boolean | undefined) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleIntakeCreated = (newIntake: Intake) => {
        setIntakes(prev => [newIntake, ...prev]);
        setTotalCount(prev => prev + 1);
        setShowCreateForm(false);
    };

    const handleIntakeUpdated = (updatedIntake: Intake) => {
        setIntakes(prev => prev.map(intake => 
            intake.id === updatedIntake.id ? updatedIntake : intake
        ));
    };

    const handleIntakeDeleted = (intakeId: number) => {
        setIntakes(prev => prev.filter(intake => intake.id !== intakeId));
        setTotalCount(prev => prev - 1);
    };

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            loadIntakes(currentPage + 1, hasActiveFilters());
        }
    };

    return (
        <Box style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Card */}
            <Card style={{ marginBottom: '2rem' }}>
                <CardHeader>
                    <CardTitle>Intakes</CardTitle>
                    <CardDescription>
                        Browse, filter, and manage your food intakes. Log new intakes or edit existing ones.
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
                                {showCreateForm ? 'Hide Log Form' : 'Log New Intake'}
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
                                placeholder="Quick search by dish name, description, or cuisine..."
                                value={filters.dish_search || ''}
                                onChange={(e) => handleFilterChange('dish_search', e.target.value)}
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
                                    ? `Found ${totalCount} intake${totalCount === 1 ? '' : 's'}${hasActiveFilters() ? ' with current filters' : ''}`
                                    : hasActiveFilters() 
                                        ? 'No intakes found matching your criteria'
                                        : 'No intakes logged yet'
                                }
                            </p>
                        </Box>
                    </VStack>
                </CardContent>
            </Card>

            {/* Create Form */}
            {showCreateForm && (
                <Box style={{ marginBottom: '2rem' }}>
                    <IntakeCreateComponent 
                        onIntakeCreated={handleIntakeCreated}
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
                            {/* Intake Time Filters */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>From Date/Time:</p>
                                    <Input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(filters.min_intake_time)}
                                        onChange={(e) => {
                                            const isoDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                            handleFilterChange('min_intake_time', isoDate);
                                        }}
                                    />
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>To Date/Time:</p>
                                    <Input
                                        type="datetime-local"
                                        value={formatDateTimeLocal(filters.max_intake_time)}
                                        onChange={(e) => {
                                            const isoDate = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                                            handleFilterChange('max_intake_time', isoDate);
                                        }}
                                    />
                                </Box>
                            </HStack>

                            {/* Portion Size and Water */}
                            <HStack spacing={1}>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Portion Size:</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="Min"
                                            value={filters.min_portion_size?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_portion_size', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder="Max"
                                            value={filters.max_portion_size?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_portion_size', e.target.value ? parseFloat(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Water (ml):</p>
                                    <HStack spacing={0.5}>
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.min_water_ml?.toString() || ''}
                                            onChange={(e) => handleFilterChange('min_water_ml', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.max_water_ml?.toString() || ''}
                                            onChange={(e) => handleFilterChange('max_water_ml', e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </HStack>
                                </Box>
                            </HStack>

                            {/* Dish-based Filters */}
                            <Box style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Dish-based Filters:</p>
                                
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

                                {/* Dish Nutritional Filters - abbreviated for space */}
                                <HStack spacing={1} style={{ marginTop: '0.5rem' }}>
                                    <Box style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Dish Calories:</p>
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
                                    <Box style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Dish Protein (g):</p>
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
                                </HStack>
                            </Box>

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

            {/* Intakes Grid */}
            {intakes.length > 0 && (
                <Grid 
                    style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}
                >
                    {intakes.map(intake => (
                        <IntakeComponent 
                            key={intake.id} 
                            intake={intake}
                            onIntakeUpdated={handleIntakeUpdated}
                            onIntakeDeleted={handleIntakeDeleted}
                        />
                    ))}
                </Grid>
            )}

            {/* Load More Button */}
            {intakes.length > 0 && currentPage < totalPages && (
                <Box style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Button onClick={handleLoadMore} disabled={isLoading}>
                        {isLoading ? 'Loading...' : `Load More (Page ${currentPage + 1} of ${totalPages})`}
                    </Button>
                </Box>
            )}

            {/* Empty State */}
            {intakes.length === 0 && !isLoading && (
                <Card>
                    <CardContent style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1rem' }}>
                            {hasActiveFilters() ? 'No intakes found matching your criteria.' : 'No intakes logged yet.'}
                        </p>
                        {hasActiveFilters() ? (
                            <Button variant="outline" onClick={handleClearFilters}>
                                Clear Filters
                            </Button>
                        ) : (
                            <Button onClick={() => setShowCreateForm(true)}>
                                Log Your First Intake
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default Intakes; 