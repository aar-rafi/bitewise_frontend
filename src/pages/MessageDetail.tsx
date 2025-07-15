import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { messagesApi, ApiError } from '../lib/api';
import { MessageComponent } from '../components/MessageComponent';
import type { Message } from '../lib/api';

const MessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedMessage = await messagesApi.getById(Number(id));
        setMessage(fetchedMessage);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(apiError.message || 'Failed to load message');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleMessageUpdated = (updatedMessage: Message) => {
    setMessage(updatedMessage);
  };

  const handleMessageDeleted = () => {
    window.location.href = '/messages';
  };

  if (loading) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '1.5rem' }}>Loading message...</div>
        </VStack>
      </Center>
    );
  }

  if (notFound) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '4rem' }}>💬</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Message Not Found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The message you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/messages'}>
            ← Back to Messages
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
                onClick={() => window.location.href = '/messages'}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Messages
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Button 
        variant="link" 
        onClick={() => window.location.href = '/messages'}
        style={{ marginBottom: '1rem', color: '#666' }}
      >
        ← Back to Messages
      </Button>
      
      <Card>
        <CardContent>
          <MessageComponent
            message={message}
            onMessageUpdated={handleMessageUpdated}
            onMessageDeleted={handleMessageDeleted}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default MessageDetail; 