import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { conversationsApi, ApiError } from '../lib/api';
import { ConversationComponent } from '../components/ConversationComponent';
import type { Conversation } from '../lib/api';

const ConversationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedConversation = await conversationsApi.getById(Number(id));
        setConversation(fetchedConversation);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(apiError.message || 'Failed to load conversation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  const handleConversationUpdated = (updatedConversation: Conversation) => {
    setConversation(updatedConversation);
  };

  const handleConversationDeleted = () => {
    window.location.href = '/conversations';
  };

  if (loading) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '1.5rem' }}>Loading conversation...</div>
        </VStack>
      </Center>
    );
  }

  if (notFound) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '4rem' }}>💬</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Conversation Not Found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The conversation you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/conversations'}>
            ← Back to Conversations
          </Button>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box style={{ padding: '2rem' }}>
        <Card>
          <CardContent>
            <VStack>
              <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/conversations'}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Conversations
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Button 
        variant="link" 
        onClick={() => window.location.href = '/conversations'}
        style={{ marginBottom: '1rem', color: '#666' }}
      >
        ← Back to Conversations
      </Button>
      
      <Card>
        <CardContent>
          <ConversationComponent
            conversation={conversation}
            onConversationUpdated={handleConversationUpdated}
            onConversationDeleted={handleConversationDeleted}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConversationDetail; 