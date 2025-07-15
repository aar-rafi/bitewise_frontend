import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { dishesApi, ApiError } from '../lib/api';
import DishComponent from '../components/DishComponent';
import type { DishResponse } from '../lib/api';

const DishDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dish, setDish] = useState<DishResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedDish = await dishesApi.getById(Number(id));
        setDish(fetchedDish);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(apiError.message || 'Failed to load dish');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  const handleDishUpdated = (updatedDish: DishResponse) => {
    setDish(updatedDish);
  };

  const handleDishDeleted = () => {
    window.location.href = '/dishes';
  };

  if (loading) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '1.5rem' }}>Loading dish...</div>
        </VStack>
      </Center>
    );
  }

  if (notFound) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '4rem' }}>🍽️</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Dish Not Found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The dish you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/dishes'}>
            ← Back to Dishes
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
                onClick={() => window.location.href = '/dishes'}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Dishes
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!dish) {
    return null;
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Button 
        variant="link" 
        onClick={() => window.location.href = '/dishes'}
        style={{ marginBottom: '1rem', color: '#666' }}
      >
        ← Back to Dishes
      </Button>
      
      <Card>
        <CardContent>
          <DishComponent
            dish={dish}
            onDishUpdated={handleDishUpdated}
            onDishDeleted={handleDishDeleted}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default DishDetail; 