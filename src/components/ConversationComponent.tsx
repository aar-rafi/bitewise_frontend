import React, { useState } from 'react';
import { conversationsApi, Conversation, ConversationUpdateRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ConversationComponentProps {
    conversation: Conversation;
    onConversationUpdated: (updatedConversation: Conversation) => void;
    onConversationDeleted: (deletedConversationId: number) => void;
}

export const ConversationComponent: React.FC<ConversationComponentProps> = ({
    conversation,
    onConversationUpdated,
    onConversationDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<ConversationUpdateRequest>({
        title: conversation.title || '',
        status: conversation.status,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            title: conversation.title || '',
            status: conversation.status,
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            title: conversation.title || '',
            status: conversation.status,
        });
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const updatedConversation = await conversationsApi.update(conversation.id, editData);
            onConversationUpdated(updatedConversation);
            setIsEditing(false);
            toast.success('Conversation updated successfully');
        } catch (error) {
            console.error('Error updating conversation:', error);
            toast.error('Failed to update conversation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this conversation? This will also delete all associated messages.')) {
            return;
        }

        try {
            await conversationsApi.delete(conversation.id);
            onConversationDeleted(conversation.id);
            toast.success('Conversation deleted successfully');
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error('Failed to delete conversation');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-yellow-100 text-yellow-800';
            case 'deleted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-lg">
                            <span 
                                onClick={() => window.location.href = `/conversations/${conversation.id}`}
                                style={{ 
                                    cursor: 'pointer', 
                                    color: '#2563eb', 
                                    textDecoration: 'underline' 
                                }}
                            >
                                Conversation (ID: {conversation.id})
                            </span>
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Badge className={getStatusColor(conversation.status)}>
                                {conversation.status}
                            </Badge>
                            {conversation.unread_count && conversation.unread_count > 0 && (
                                <Badge variant="destructive">
                                    {conversation.unread_count} unread
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <>
                                <Button variant="outline" size="sm" onClick={handleEdit}>
                                    Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={editData.title || ''}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                placeholder="Conversation title..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select 
                                value={editData.status || conversation.status} 
                                onValueChange={(value) => setEditData({ ...editData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <strong>Title:</strong>
                            <p className="mt-1">
                                {conversation.title || 'No title'}
                            </p>
                        </div>

                        {conversation.last_message_preview && (
                            <div>
                                <strong>Last Message:</strong>
                                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                    {conversation.last_message_preview}
                                </p>
                                {conversation.last_message_time && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {formatDate(conversation.last_message_time)}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>User ID:</strong> {conversation.user_id}
                            </div>
                            <div>
                                <strong>Status:</strong> {conversation.status}
                            </div>
                            {conversation.unread_count !== undefined && (
                                <div>
                                    <strong>Unread Count:</strong> {conversation.unread_count}
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-600">
                            <div><strong>Created:</strong> {formatDate(conversation.created_at)}</div>
                            <div><strong>Updated:</strong> {formatDate(conversation.updated_at)}</div>
                        </div>

                        {conversation.extra_data && Object.keys(conversation.extra_data).length > 0 && (
                            <div>
                                <strong>Extra Data:</strong>
                                <pre className="mt-1 p-2 bg-gray-50 rounded-md text-xs">
                                    {JSON.stringify(conversation.extra_data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {isEditing && (
                <CardFooter className="gap-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}; 