import React, { useState, useEffect } from 'react';
import { usersApi, UserItem, UserFilterParams, UserListResponse } from '@/lib/api';
import { UserComponent } from '@/components/UserComponent';
import DateTimePicker from '@/components/DateTimePicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Users() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
    const [isVerifiedFilter, setIsVerifiedFilter] = useState<boolean | null>(null);
    const [isSuperuserFilter, setIsSuperuserFilter] = useState<boolean | null>(null);
    const [oauthProviderFilter, setOauthProviderFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [locationCityFilter, setLocationCityFilter] = useState('');
    const [locationCountryFilter, setLocationCountryFilter] = useState('');
    const [cookingSkillFilter, setCookingSkillFilter] = useState('all');
    const [minCreatedAt, setMinCreatedAt] = useState('');
    const [maxCreatedAt, setMaxCreatedAt] = useState('');
    const [minLastLogin, setMinLastLogin] = useState('');
    const [maxLastLogin, setMaxLastLogin] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [maxHeight, setMaxHeight] = useState('');
    const [minWeight, setMinWeight] = useState('');
    const [maxWeight, setMaxWeight] = useState('');

    const pageSize = 20;

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            let response: UserListResponse;
            
            const hasFilters = searchTerm || isActiveFilter !== null || isVerifiedFilter !== null || 
                             isSuperuserFilter !== null || (oauthProviderFilter && oauthProviderFilter !== 'all') || 
                             (genderFilter && genderFilter !== 'all') ||
                             locationCityFilter || locationCountryFilter || (cookingSkillFilter && cookingSkillFilter !== 'all') ||
                             minCreatedAt || maxCreatedAt || minLastLogin || maxLastLogin ||
                             minHeight || maxHeight || minWeight || maxWeight;

            if (hasFilters) {
                const filters: UserFilterParams = {};
                if (searchTerm) filters.search = searchTerm;
                if (isActiveFilter !== null) filters.is_active = isActiveFilter;
                if (isVerifiedFilter !== null) filters.is_verified = isVerifiedFilter;
                if (isSuperuserFilter !== null) filters.is_superuser = isSuperuserFilter;
                if (oauthProviderFilter && oauthProviderFilter !== 'all') filters.oauth_provider = oauthProviderFilter;
                if (genderFilter && genderFilter !== 'all') filters.gender = genderFilter;
                if (locationCityFilter) filters.location_city = locationCityFilter;
                if (locationCountryFilter) filters.location_country = locationCountryFilter;
                if (cookingSkillFilter && cookingSkillFilter !== 'all') filters.cooking_skill_level = cookingSkillFilter;
                if (minCreatedAt) filters.min_created_at = minCreatedAt;
                if (maxCreatedAt) filters.max_created_at = maxCreatedAt;
                if (minLastLogin) filters.min_last_login = minLastLogin;
                if (maxLastLogin) filters.max_last_login = maxLastLogin;
                if (minHeight) filters.min_height = parseInt(minHeight);
                if (maxHeight) filters.max_height = parseInt(maxHeight);
                if (minWeight) filters.min_weight = parseInt(minWeight);
                if (maxWeight) filters.max_weight = parseInt(maxWeight);

                response = await usersApi.filter(filters, currentPage, pageSize);
            } else {
                response = await usersApi.getAll(currentPage, pageSize);
            }

            setUsers(response.users);
            setTotalPages(response.total_pages);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadUsers();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setIsActiveFilter(null);
        setIsVerifiedFilter(null);
        setIsSuperuserFilter(null);
        setOauthProviderFilter('all');
        setGenderFilter('all');
        setLocationCityFilter('');
        setLocationCountryFilter('');
        setCookingSkillFilter('all');
        setMinCreatedAt('');
        setMaxCreatedAt('');
        setMinLastLogin('');
        setMaxLastLogin('');
        setMinHeight('');
        setMaxHeight('');
        setMinWeight('');
        setMaxWeight('');
        setCurrentPage(1);
        loadUsers();
    };

    const handleUserUpdated = (updatedUser: UserItem) => {
        setUsers(prev => prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
        ));
    };

    const handleUserDeleted = (deletedUserId: number) => {
        setUsers(prev => prev.filter(user => user.id !== deletedUserId));
        setTotalCount(prev => prev - 1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (isActiveFilter !== null) count++;
        if (isVerifiedFilter !== null) count++;
        if (isSuperuserFilter !== null) count++;
        if (oauthProviderFilter && oauthProviderFilter !== 'all') count++;
        if (genderFilter && genderFilter !== 'all') count++;
        if (locationCityFilter) count++;
        if (locationCountryFilter) count++;
        if (cookingSkillFilter && cookingSkillFilter !== 'all') count++;
        if (minCreatedAt) count++;
        if (maxCreatedAt) count++;
        if (minLastLogin) count++;
        if (maxLastLogin) count++;
        if (minHeight) count++;
        if (maxHeight) count++;
        if (minWeight) count++;
        if (maxWeight) count++;
        return count;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-gray-600">View and manage user accounts</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Filters</CardTitle>
                        {getFilterCount() > 0 && (
                            <Badge variant="secondary">
                                {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} active
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <Input
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search email, username, full name..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Account Status</Label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isActive"
                                        checked={isActiveFilter === null}
                                        onChange={() => setIsActiveFilter(null)}
                                    />
                                    <span>All</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isActive"
                                        checked={isActiveFilter === true}
                                        onChange={() => setIsActiveFilter(true)}
                                    />
                                    <span>Active</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isActive"
                                        checked={isActiveFilter === false}
                                        onChange={() => setIsActiveFilter(false)}
                                    />
                                    <span>Inactive</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Verification Status</Label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isVerified"
                                        checked={isVerifiedFilter === null}
                                        onChange={() => setIsVerifiedFilter(null)}
                                    />
                                    <span>All</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isVerified"
                                        checked={isVerifiedFilter === true}
                                        onChange={() => setIsVerifiedFilter(true)}
                                    />
                                    <span>Verified</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isVerified"
                                        checked={isVerifiedFilter === false}
                                        onChange={() => setIsVerifiedFilter(false)}
                                    />
                                    <span>Unverified</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Admin Status</Label>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isSuperuser"
                                        checked={isSuperuserFilter === null}
                                        onChange={() => setIsSuperuserFilter(null)}
                                    />
                                    <span>All</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isSuperuser"
                                        checked={isSuperuserFilter === true}
                                        onChange={() => setIsSuperuserFilter(true)}
                                    />
                                    <span>Admin</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="isSuperuser"
                                        checked={isSuperuserFilter === false}
                                        onChange={() => setIsSuperuserFilter(false)}
                                    />
                                    <span>Regular</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="oauth_provider">OAuth Provider</Label>
                            <Select value={oauthProviderFilter} onValueChange={setOauthProviderFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All providers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All providers</SelectItem>
                                    <SelectItem value="google">Google</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="github">GitHub</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={genderFilter} onValueChange={setGenderFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All genders" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cooking_skill">Cooking Skill</Label>
                            <Select value={cookingSkillFilter} onValueChange={setCookingSkillFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All skill levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All skill levels</SelectItem>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="expert">Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location_city">City</Label>
                            <Input
                                id="location_city"
                                value={locationCityFilter}
                                onChange={(e) => setLocationCityFilter(e.target.value)}
                                placeholder="Filter by city..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location_country">Country</Label>
                            <Input
                                id="location_country"
                                value={locationCountryFilter}
                                onChange={(e) => setLocationCountryFilter(e.target.value)}
                                placeholder="Filter by country..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="space-y-2">
                            <Label>Created After</Label>
                            <DateTimePicker
                                value={minCreatedAt}
                                onChange={setMinCreatedAt}
                                placeholder="Select minimum date..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Created Before</Label>
                            <DateTimePicker
                                value={maxCreatedAt}
                                onChange={setMaxCreatedAt}
                                placeholder="Select maximum date..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Last Login After</Label>
                            <DateTimePicker
                                value={minLastLogin}
                                onChange={setMinLastLogin}
                                placeholder="Select minimum date..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Last Login Before</Label>
                            <DateTimePicker
                                value={maxLastLogin}
                                onChange={setMaxLastLogin}
                                placeholder="Select maximum date..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_height">Min Height (cm)</Label>
                            <Input
                                id="min_height"
                                type="number"
                                value={minHeight}
                                onChange={(e) => setMinHeight(e.target.value)}
                                placeholder="Min height..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_height">Max Height (cm)</Label>
                            <Input
                                id="max_height"
                                type="number"
                                value={maxHeight}
                                onChange={(e) => setMaxHeight(e.target.value)}
                                placeholder="Max height..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="min_weight">Min Weight (kg)</Label>
                            <Input
                                id="min_weight"
                                type="number"
                                value={minWeight}
                                onChange={(e) => setMinWeight(e.target.value)}
                                placeholder="Min weight..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_weight">Max Weight (kg)</Label>
                            <Input
                                id="max_weight"
                                type="number"
                                value={maxWeight}
                                onChange={(e) => setMaxWeight(e.target.value)}
                                placeholder="Max weight..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Apply Filters'}
                        </Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Users</CardTitle>
                        <Badge variant="outline">
                            {totalCount} total user{totalCount !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p>Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No users found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <UserComponent
                                    key={user.id}
                                    user={user}
                                    onUserUpdated={handleUserUpdated}
                                    onUserDeleted={handleUserDeleted}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || isLoading}
                            >
                                Previous
                            </Button>
                            
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === currentPage ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={isLoading}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 