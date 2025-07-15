import React, { useState, useEffect } from 'react';
import { messagesApi, Message, MessageFilterParams, MessageListResponse } from '@/lib/api';
import { MessageComponent } from '@/components/MessageComponent';
import DateTimePicker from '@/components/DateTimePicker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Messages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [conversationIdFilter, setConversationIdFilter] = useState('');
    const [messageTypeFilter, setMessageTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUserMessageFilter, setIsUserMessageFilter] = useState('all');
    const [hasAttachmentsFilter, setHasAttachmentsFilter] = useState('all');
    const [minCreatedAt, setMinCreatedAt] = useState('');
    const [maxCreatedAt, setMaxCreatedAt] = useState('');
    const [minTokens, setMinTokens] = useState('');
    const [maxTokens, setMaxTokens] = useState('');

    const pageSize = 20;

    useEffect(() => {
        loadMessages();
    }, [currentPage]);

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            let response: MessageListResponse;
            
            const hasFilters = searchTerm || conversationIdFilter || 
                             (messageTypeFilter && messageTypeFilter !== 'all') || 
                             (statusFilter && statusFilter !== 'all') || 
                             (isUserMessageFilter && isUserMessageFilter !== 'all') || 
                             (hasAttachmentsFilter && hasAttachmentsFilter !== 'all') ||
                             minCreatedAt || maxCreatedAt || minTokens || maxTokens;

            if (hasFilters) {
                const filters: MessageFilterParams = {};
                if (searchTerm) filters.search = searchTerm;
                if (conversationIdFilter) filters.conversation_id = parseInt(conversationIdFilter);
                if (messageTypeFilter && messageTypeFilter !== 'all') filters.message_type = messageTypeFilter;
                if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
                if (isUserMessageFilter && isUserMessageFilter !== 'all') {
                    filters.is_user_message = isUserMessageFilter === 'user';
                }
                if (hasAttachmentsFilter && hasAttachmentsFilter !== 'all') {
                    filters.has_attachments = hasAttachmentsFilter === 'yes';
                }
                if (minCreatedAt) filters.min_created_at = minCreatedAt;
                if (maxCreatedAt) filters.max_created_at = maxCreatedAt;
                if (minTokens) filters.min_tokens = parseInt(minTokens);
                if (maxTokens) filters.max_tokens = parseInt(maxTokens);

                response = await messagesApi.filterAll(filters, currentPage, pageSize);
            } else {
                response = await messagesApi.getAll(currentPage, pageSize);
            }

            setMessages(response.messages);
            setTotalPages(response.total_pages);
            setTotalCount(response.total_count);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        loadMessages();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setConversationIdFilter('');
        setMessageTypeFilter('all');
        setStatusFilter('all');
        setIsUserMessageFilter('all');
        setHasAttachmentsFilter('all');
        setMinCreatedAt('');
        setMaxCreatedAt('');
        setMinTokens('');
        setMaxTokens('');
        setCurrentPage(1);
        loadMessages();
    };

    const handleMessageUpdated = (updatedMessage: Message) => {
        setMessages(prev => prev.map(message => 
            message.id === updatedMessage.id ? updatedMessage : message
        ));
    };

    const handleMessageDeleted = (deletedMessageId: number) => {
        setMessages(prev => prev.filter(message => message.id !== deletedMessageId));
        setTotalCount(prev => prev - 1);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const getFilterCount = () => {
        let count = 0;
        if (searchTerm) count++;
        if (conversationIdFilter) count++;
        if (messageTypeFilter && messageTypeFilter !== 'all') count++;
        if (statusFilter && statusFilter !== 'all') count++;
        if (isUserMessageFilter && isUserMessageFilter !== 'all') count++;
        if (hasAttachmentsFilter && hasAttachmentsFilter !== 'all') count++;
        if (minCreatedAt) count++;
        if (maxCreatedAt) count++;
        if (minTokens) count++;
        if (maxTokens) count++;
        return count;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Messages</h1>
                    <p className="text-gray-600">
                        View and manage all messages across conversations
                    </p>
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
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Content</Label>
                            <Input
                                id="search"
                                placeholder="Search in message content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Conversation ID */}
                        <div className="space-y-2">
                            <Label htmlFor="conversation_id">Conversation ID</Label>
                            <Input
                                id="conversation_id"
                                type="number"
                                placeholder="Filter by conversation ID..."
                                value={conversationIdFilter}
                                onChange={(e) => setConversationIdFilter(e.target.value)}
                            />
                        </div>

                        {/* Message Type */}
                        <div className="space-y-2">
                            <Label htmlFor="message_type">Message Type</Label>
                            <Select value={messageTypeFilter} onValueChange={setMessageTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="IMAGE">Image</SelectItem>
                                    <SelectItem value="CONTROL">Control</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="SENT">Sent</SelectItem>
                                    <SelectItem value="READ">Read</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* User/AI Message */}
                        <div className="space-y-2">
                            <Label htmlFor="user_message">Message Source</Label>
                            <Select value={isUserMessageFilter} onValueChange={setIsUserMessageFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All messages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Messages</SelectItem>
                                    <SelectItem value="user">User Messages</SelectItem>
                                    <SelectItem value="ai">AI Messages</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Has Attachments */}
                        <div className="space-y-2">
                            <Label htmlFor="attachments">Attachments</Label>
                            <Select value={hasAttachmentsFilter} onValueChange={setHasAttachmentsFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All messages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Messages</SelectItem>
                                    <SelectItem value="yes">With Attachments</SelectItem>
                                    <SelectItem value="no">Without Attachments</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <Label htmlFor="min_created_at">Created After</Label>
                            <DateTimePicker
                                value={minCreatedAt}
                                onChange={setMinCreatedAt}
                                placeholder="Select start date..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_created_at">Created Before</Label>
                            <DateTimePicker
                                value={maxCreatedAt}
                                onChange={setMaxCreatedAt}
                                placeholder="Select end date..."
                            />
                        </div>

                        {/* Token Count Range */}
                        <div className="space-y-2">
                            <Label htmlFor="min_tokens">Min Tokens</Label>
                            <Input
                                id="min_tokens"
                                type="number"
                                placeholder="Minimum token count..."
                                value={minTokens}
                                onChange={(e) => setMinTokens(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max_tokens">Max Tokens</Label>
                            <Input
                                id="max_tokens"
                                type="number"
                                placeholder="Maximum token count..."
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSearch}>Apply Filters</Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Messages ({totalCount} total)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No messages found. Try adjusting your filters.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <MessageComponent
                                    key={message.id}
                                    message={message}
                                    onMessageUpdated={handleMessageUpdated}
                                    onMessageDeleted={handleMessageDeleted}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
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