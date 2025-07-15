import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { intakesApi, ApiError } from '../lib/api';
import IntakeComponent from '../components/IntakeComponent';
import type { Intake } from '../lib/api';

const IntakeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [intake, setIntake] = useState<Intake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchIntake = async () => {
      if (!id || isNaN(Number(id))) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedIntake = await intakesApi.getById(Number(id));
        setIntake(fetchedIntake);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setError(apiError.message || 'Failed to load intake');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIntake();
  }, [id]);

  const handleIntakeUpdated = (updatedIntake: Intake) => {
    setIntake(updatedIntake);
  };

  const handleIntakeDeleted = () => {
    window.location.href = '/intakes';
  };

  if (loading) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '1.5rem' }}>Loading intake...</div>
        </VStack>
      </Center>
    );
  }

  if (notFound) {
    return (
      <Center style={{ padding: '2rem' }}>
        <VStack>
          <div style={{ fontSize: '4rem' }}>🍽️</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Intake Not Found</h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            The intake record you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => window.location.href = '/intakes'}>
            ← Back to Intakes
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
                onClick={() => window.location.href = '/intakes'}
                style={{ marginTop: '0.5rem' }}
              >
                ← Back to Intakes
              </Button>
            </VStack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!intake) {
    return null;
  }

  return (
    <Box style={{ padding: '2rem' }}>
      <Button 
        variant="link" 
        onClick={() => window.location.href = '/intakes'}
        style={{ marginBottom: '1rem', color: '#666' }}
      >
        ← Back to Intakes
      </Button>
      
      <Card>
        <CardContent>
          <IntakeComponent
            intake={intake}
            onIntakeUpdated={handleIntakeUpdated}
            onIntakeDeleted={handleIntakeDeleted}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default IntakeDetail; 