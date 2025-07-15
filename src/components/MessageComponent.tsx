import React, { useState } from 'react';
import { messagesApi, Message, MessageUpdateRequest } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MessageComponentProps {
    message: Message;
    onMessageUpdated: (updatedMessage: Message) => void;
    onMessageDeleted: (deletedMessageId: number) => void;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
    message,
    onMessageUpdated,
    onMessageDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<MessageUpdateRequest>({
        content: message.content,
        status: message.status,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            content: message.content,
            status: message.status,
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({
            content: message.content,
            status: message.status,
        });
    };

    const handleSave = async () => {
        if (!editData.content?.trim()) {
            toast.error('Content is required');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedMessage = await messagesApi.update(message.id, editData);
            onMessageUpdated(updatedMessage);
            setIsEditing(false);
            toast.success('Message updated successfully');
        } catch (error) {
            console.error('Error updating message:', error);
            toast.error('Failed to update message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            await messagesApi.delete(message.id);
            onMessageDeleted(message.id);
            toast.success('Message deleted successfully');
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getMessageTypeColor = (type: string) => {
        switch (type) {
            case 'text': return 'bg-blue-100 text-blue-800';
            case 'image': return 'bg-green-100 text-green-800';
            case 'file': return 'bg-purple-100 text-purple-800';
            case 'system': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'read': return 'bg-purple-100 text-purple-800';
            case 'edited': return 'bg-yellow-100 text-yellow-800';
            case 'deleted': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className={`mb-4 ${message.is_user_message ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-lg">
                            <span 
                                onClick={() => window.location.href = `/messages/${message.id}`}
                                style={{ 
                                    cursor: 'pointer', 
                                    color: '#2563eb', 
                                    textDecoration: 'underline' 
                                }}
                            >
                                {message.is_user_message ? 'User Message' : 'AI Message'} (ID: {message.id})
                            </span>
                        </CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <Badge className={getMessageTypeColor(message.message_type)}>
                                {message.message_type}
                            </Badge>
                            <Badge className={getStatusColor(message.status)}>
                                {message.status}
                            </Badge>
                            {message.attachments && (
                                <Badge variant="outline">Has Attachments</Badge>
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
                            <label className="text-sm font-medium">Content</label>
                            <Textarea
                                value={editData.content || ''}
                                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                                rows={4}
                                placeholder="Message content..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <Select 
                                value={editData.status || message.status} 
                                onValueChange={(value) => setEditData({ ...editData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="edited">Edited</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <strong>Content:</strong>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                                {message.content}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Conversation ID:</strong> {message.conversation_id}
                            </div>
                            <div>
                                <strong>User ID:</strong> {message.user_id}
                            </div>
                            {message.llm_model_id && (
                                <div>
                                    <strong>LLM Model ID:</strong> {message.llm_model_id}
                                </div>
                            )}
                            {message.parent_message_id && (
                                <div>
                                    <strong>Parent Message ID:</strong> {message.parent_message_id}
                                </div>
                            )}
                            {message.input_tokens && (
                                <div>
                                    <strong>Input Tokens:</strong> {message.input_tokens}
                                </div>
                            )}
                            {message.output_tokens && (
                                <div>
                                    <strong>Output Tokens:</strong> {message.output_tokens}
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-600">
                            <div><strong>Created:</strong> {formatDate(message.created_at)}</div>
                            <div><strong>Updated:</strong> {formatDate(message.updated_at)}</div>
                        </div>

                        {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div>
                                <strong>Reactions:</strong>
                                <pre className="mt-1 p-2 bg-gray-50 rounded-md text-xs">
                                    {JSON.stringify(message.reactions, null, 2)}
                                </pre>
                            </div>
                        )}

                        {message.extra_data && Object.keys(message.extra_data).length > 0 && (
                            <div>
                                <strong>Extra Data:</strong>
                                <pre className="mt-1 p-2 bg-gray-50 rounded-md text-xs">
                                    {JSON.stringify(message.extra_data, null, 2)}
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