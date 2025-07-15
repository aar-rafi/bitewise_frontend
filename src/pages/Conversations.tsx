import React, { useState, useEffect } from 'react';
import { conversationsApi, Conversation, ConversationFilterParams, ConversationListResponse } from '@/lib/api';
import { ConversationComponent } from '@/components/ConversationComponent';
import DateTimePicker from '@/components/DateTimePicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Conversations() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [minCreatedAt, setMinCreatedAt] = useState('');
    const [maxCreatedAt, setMaxCreatedAt] = useState('');
    const [minMessageCount, setMinMessageCount] = useState('');
    const [maxMessageCount, setMaxMessageCount] = useState('');

    const pageSize = 20;

    useEffect(() => {
        loadConversations();
    }, [currentPage]);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            let response: ConversationListResponse;
            
            const hasFilters = searchTerm || (statusFilter && statusFilter !== 'all') || 
                             minCreatedAt || maxCreatedAt || minMessageCount || maxMessageCount;

            if (hasFilters) {
                const filters: ConversationFilterParams = {};
                if (searchTerm) filters.search = searchTerm;
                if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
                if (minCreatedAt) filters.min_created_at = minCreatedAt;
                if (maxCreatedAt) filters.max_created_at = maxCreatedAt;
                if (minMessageCount) filters.min_message_count = parseInt(minMessageCount);
                if (maxMessageCount) filters.max_message_count = parseInt(maxMessageCount);

                response = await conversationsApi.filter(filters, currentPage, pageSize);
            } else {
                response = await conversationsApi.getAll(currentPage, pageSize);
            }

            setConversations(response.conversations);
            setTotalPages(response.total_pages);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error('Error loading conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadConversations();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setMinCreatedAt('');
        setMaxCreatedAt('');
        setMinMessageCount('');
        setMaxMessageCount('');
        setCurrentPage(1);
        loadConversations();
    };

    const handleConversationUpdated = (updatedConversation: Conversation) => {
        setConversations(prev => prev.map(conversation => 
            conversation.id === updatedConversation.id ? updatedConversation : conversation
        ));
    };

    const handleConversationDeleted = (deletedConversationId: number) => {
        setConversations(prev => prev.filter(conversation => conversation.id !== deletedConversationId));
        setTotalCount(prev => prev - 1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter && statusFilter !== 'all') count++;
        if (minCreatedAt) count++;
        if (maxCreatedAt) count++;
        if (minMessageCount) count++;
        if (maxMessageCount) count++;
        return count;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Conversations</h1>
                    <p className="text-gray-600">View and manage conversations</p>
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
                            <Label htmlFor="search">Search Title</Label>
                            <Input
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search in conversation titles..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <Label htmlFor="min_message_count">Min Message Count</Label>
                            <Input
                                id="min_message_count"
                                type="number"
                                value={minMessageCount}
                                onChange={(e) => setMinMessageCount(e.target.value)}
                                placeholder="Minimum messages..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_message_count">Max Message Count</Label>
                            <Input
                                id="max_message_count"
                                type="number"
                                value={maxMessageCount}
                                onChange={(e) => setMaxMessageCount(e.target.value)}
                                placeholder="Maximum messages..."
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
                        <CardTitle>Conversations</CardTitle>
                        <Badge variant="outline">
                            {totalCount} total conversation{totalCount !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p>Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No conversations found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {conversations.map((conversation) => (
                                <ConversationComponent
                                    key={conversation.id}
                                    conversation={conversation}
                                    onConversationUpdated={handleConversationUpdated}
                                    onConversationDeleted={handleConversationDeleted}
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