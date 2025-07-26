import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useConversations,
  useCreateConversation,
  useUpdateConversation,
  useDeleteConversation,
} from "@/hooks/useChat";
import { Conversation } from "@/types/chat";

interface ConversationListProps {
  selectedConversationId?: number;
  onSelectConversation: (conversationId: number) => void;
}

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConversation, setEditingConversation] =
    useState<Conversation | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const { data: conversationsResponse, isLoading, error } = useConversations();
  const conversations = conversationsResponse?.conversations || [];
  const createConversation = useCreateConversation();
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation();

  const handleCreateConversation = async () => {
    if (!newConversationTitle.trim()) return;

    try {
      const newConversation = await createConversation.mutateAsync({
        title: newConversationTitle,
      });
      setNewConversationTitle("");
      setIsCreateDialogOpen(false);
      onSelectConversation(newConversation.id);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleUpdateConversation = async () => {
    if (!editingConversation || !editTitle.trim()) return;

    try {
      await updateConversation.mutateAsync({
        id: editingConversation.id,
        data: { title: editTitle },
      });
      setEditingConversation(null);
      setEditTitle("");
    } catch (error) {
      console.error("Failed to update conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversation.mutateAsync(conversationId);
      if (selectedConversationId === conversationId) {
        // Select first available conversation or none
        const remaining = conversations.filter((c) => c.id !== conversationId);
        if (remaining && remaining.length > 0) {
          onSelectConversation(remaining[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleArchiveConversation = async (conversation: Conversation) => {
    try {
      await updateConversation.mutateAsync({
        id: conversation.id,
        data: {
          status: conversation.status === "active" ? "archived" : "active",
        },
      });
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Conversations</h2>
          <Skeleton className="h-8 w-8" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Failed to load conversations
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold">Conversations</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Conversation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                  placeholder="Enter conversation title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateConversation();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateConversation}
                  disabled={
                    createConversation.isPending || !newConversationTitle.trim()
                  }
                >
                  {createConversation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">
        {conversations.map((conversation) => (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedConversationId === conversation.id
                ? "bg-muted border-primary"
                : ""
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate mb-1">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConversation(conversation);
                        setEditTitle(conversation.title);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveConversation(conversation);
                      }}
                    >
                      {conversation.status === "active" ? (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}

        {conversations.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm">
              Create your first conversation to get started
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingConversation}
        onOpenChange={() => setEditingConversation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter conversation title"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateConversation();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingConversation(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateConversation}
                disabled={updateConversation.isPending || !editTitle.trim()}
              >
                {updateConversation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
