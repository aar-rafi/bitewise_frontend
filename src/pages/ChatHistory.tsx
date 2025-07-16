import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, MessageCircle, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageList } from "@/components/chat/MessageList";
import { getChatsByDateRange, getMessagesByDateRange } from "@/services/chatApi";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation as BaseConversation, Message as BaseMessage } from "@/types/chat";

interface Conversation extends Omit<BaseConversation, 'id'> {
  id: string | number;
  message_count: number;
  last_message_preview: string | null;
  last_message_at: string | null;
}

interface Message extends Omit<BaseMessage, 'id' | 'conversation_id'> {
  id: string | number;
  conversation_id: string | number;
}

interface ChatHistoryResponse {
  conversations: Conversation[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface MessageHistoryResponse {
  messages: Message[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function ChatHistory() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(format(today, "yyyy-MM-dd"));
    setStartDate(format(thirtyDaysAgo, "yyyy-MM-dd"));
  }, []);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    setError(null);
    setConversations([]);
    setMessages([]);
    setSelectedConversation(null);

    try {
      const response = await getChatsByDateRange(startDate, endDate, 1, 50);
      setConversations(response.conversations as Conversation[]);
      setTotalConversations(response.total_count);
      setCurrentPage(response.page);
    } catch (err: any) {
      setError(err.message || "Failed to fetch chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (conversationId: string | number) => {
    const numericId = typeof conversationId === 'string' ? parseInt(conversationId) : conversationId;
    setSelectedConversation(numericId);
    setMessagesLoading(true);
    setShowMessagesDialog(true);

    try {
      const response = await getMessagesByDateRange(
        startDate,
        endDate,
        numericId,
        1,
        100
      );
      setMessages(response.messages as Message[]);
      setTotalMessages(response.total_count);
    } catch (err: any) {
      setError(err.message || "Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleViewAllMessages = async () => {
    if (!startDate || !endDate) return;

    setMessagesLoading(true);
    setShowMessagesDialog(true);
    setSelectedConversation(null);

    try {
      const response = await getMessagesByDateRange(
        startDate,
        endDate,
        undefined,
        1,
        100
      );
      setMessages(response.messages as Message[]);
      setTotalMessages(response.total_count);
    } catch (err: any) {
      setError(err.message || "Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-green-800">
              <MessageCircle className="h-7 w-7" />
              Chat History
            </CardTitle>
            <p className="text-green-600">
              View your conversations and messages within a specific date range
            </p>
          </CardHeader>
        </Card>

        {/* Date Range Selection */}
        <Card className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-700">
              <Calendar className="h-5 w-5" />
              Select Date Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-nutrition-green hover:bg-nutrition-emerald text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Conversations"}
              </Button>
              
              {conversations.length > 0 && (
                <Button 
                  onClick={handleViewAllMessages}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  View All Messages
                </Button>
              )}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        {(conversations.length > 0 || loading) && (
          <Card className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4 text-sm text-green-700">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {totalConversations} conversations found
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    {startDate} to {endDate}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conversations List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="backdrop-blur-lg bg-white/70 border border-white/20">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:bg-white/80"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-green-800">
                        {conversation.title || `Conversation ${conversation.id}`}
                      </h3>
                      {conversation.last_message_preview && (
                        <p className="text-sm text-green-600 line-clamp-2">
                          {conversation.last_message_preview}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-green-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(conversation.created_at), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          {conversation.message_count} messages
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !loading && startDate && endDate ? (
          <Card className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">No conversations found</h3>
              <p className="text-green-600">
                No conversations were found in the selected date range. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Messages Dialog */}
        <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] backdrop-blur-lg bg-white/90">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {selectedConversation 
                  ? `Messages from Conversation ${selectedConversation}`
                  : `All Messages (${startDate} to ${endDate})`
                }
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              {messagesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.is_user_message 
                          ? "bg-green-100 border-l-4 border-green-500 ml-8" 
                          : "bg-blue-50 border-l-4 border-blue-500 mr-8"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge 
                          variant={message.is_user_message ? "default" : "secondary"}
                          className={message.is_user_message ? "bg-green-600" : "bg-blue-600"}
                        >
                          {message.is_user_message ? "You" : "AI Assistant"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.created_at), "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                      {!selectedConversation && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            Conversation {message.conversation_id}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {messages.length === 100 && (
                    <div className="text-center py-4">
                      <Badge variant="outline" className="text-green-700">
                        Showing first 100 messages
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No messages found in this conversation.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 