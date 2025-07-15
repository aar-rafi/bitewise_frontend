import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { usersApi, ApiError } from '../lib/api';
import { UserComponent } from '../components/UserComponent';
import type { UserItem } from '../lib/api';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedUser = await usersApi.getById(Number(id));
        setUser(fetchedUser);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(apiError.message || 'Failed to load user');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUserUpdated = (updatedUser: UserItem) => {
    setUser(updatedUser);
  };

  const handleUserDeleted = () => {
    window.location.href = '/users';
  };

  if (loading) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '1.5rem' }}>Loading user...</div>
        </VStack>
      </Center>
    );
  }

  if (notFound) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '4rem' }}>👤</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>User Not Found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The user you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/users'}>
            ← Back to Users
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
                onClick={() => window.location.href = '/users'}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Users
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Button 
        variant="link" 
        onClick={() => window.location.href = '/users'}
        style={{ marginBottom: '1rem', color: '#666' }}
      >
        ← Back to Users
      </Button>
      
      <Card>
        <CardContent>
          <UserComponent
            user={user}
            onUserUpdated={handleUserUpdated}
            onUserDeleted={handleUserDeleted}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetail; 