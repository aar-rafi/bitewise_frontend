import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid } from '@/components/ui/grid';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Flex } from '@/components/ui/flex';
import { Spacer } from '@/components/ui/spacer';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { profile } from 'console';
import { toast } from 'sonner';

// Hardcoded dish data
const dishes = [
  {
    id: 1,
    name: "Grilled Chicken Salad",
    description: "Fresh mixed greens with perfectly grilled chicken breast, cherry tomatoes, and a light vinaigrette dressing",
    cookingTime: "25 minutes"
  },
  {
    id: 2,
    name: "Vegetable Stir Fry", 
    description: "Colorful seasonal vegetables stir-fried with garlic, ginger, and soy sauce served over jasmine rice",
    cookingTime: "15 minutes"
  },
  {
    id: 3,
    name: "Salmon with Quinoa",
    description: "Pan-seared salmon fillet with herb-crusted quinoa, roasted asparagus, and lemon butter sauce",
    cookingTime: "30 minutes"
  }
];

// Predefined search data
const searchableItems = ["chicken", "salmon", "vegetable", "quinoa", "salad", "stir fry"];

const Demo: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState("");

  const handleSearch = () => {
    const found = searchableItems.find(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResult(found ? `Found: ${found}` : "Not found");
  };

  const dummyFunc = () => {
    console.log("Hello World");
  }

  const deleteMessages = async () => {
    try{
      const count = await profileApi.deleteMessages();
      console.log("Deleted ", count, " messages");
      toast.success(`Deleted ${count} messages`)
    } catch(err){
      console.log(err);
    }
  }

  useEffect(() => {
    const fetchCount = async () => {
      try{
        const count = await profileApi.getMessageCount();
        console.log(count);
        toast.success(`Loaded ${count} messages`)
      } catch(err){
        console.log(err);
      }
    }

    fetchCount();
  },[])

  return (
    <Box p={2} maxWidth="1200px" mx="auto">
      
      {/* Header */}
      <Center mb={2}>
        <VStack spacing={0.5}>
          <h1 style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>
            Demo Templates
          </h1>
          <p style={{ color: '#666' }}>Frontend component templates for experimentation</p>
        </VStack>
      </Center>

      {/* Layout Components Demo */}
      <Box mb={2}>
        <Card>
          <CardHeader>
            <CardTitle>Layout Components Demo</CardTitle>
            <CardDescription>Chakra UI-style layout components: Center, HStack, VStack, Flex, Spacer</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={1}>
              {/* Center Demo */}
              <Box border="1px solid #e2e8f0" borderRadius="8px" p={2}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Center:</p>
                <Center h="60px" bg="#f7fafc" borderRadius="4px">
                  <Badge>Centered Content</Badge>
                </Center>
              </Box>

              {/* HStack Demo */}
              <Box border="1px solid #e2e8f0" borderRadius="8px" p={2}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>HStack with spacing:</p>
                <HStack spacing={1}>
                  <Button size="sm">Button 1</Button>
                  <Button size="sm" variant="outline">Button 2</Button>
                  <Button size="sm" variant="secondary">Button 3</Button>
                </HStack>
              </Box>

              {/* VStack Demo */}
              <Box border="1px solid #e2e8f0" borderRadius="8px" p={2}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>VStack with spacing:</p>
                <VStack spacing={0.5} alignItems="flex-start">
                  <Badge>Item 1</Badge>
                  <Badge variant="secondary">Item 2</Badge>
                  <Badge variant="outline">Item 3</Badge>
                </VStack>
              </Box>

              {/* Flex with Spacer Demo */}
              <Box border="1px solid #e2e8f0" borderRadius="8px" p={2}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Flex with Spacer:</p>
                <Flex alignItems="center" p={2} bg="#f7fafc" borderRadius="4px">
                  <Badge>Left Content</Badge>
                  <Spacer />
                  <Button size="sm">Right Button</Button>
                </Flex>
              </Box>

              {/* Complex Layout Demo */}
              <Box border="1px solid #e2e8f0" borderRadius="8px" p={2}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Complex Layout:</p>
                <VStack spacing={1}>
                  <HStack spacing={1} w="100%">
                    <VStack spacing={0.5} flex="1">
                      <Badge>Column 1 Item 1</Badge>
                      <Badge variant="secondary">Column 1 Item 2</Badge>
                    </VStack>
                    <Center flex="1" bg="#f7fafc" h="60px" borderRadius="4px">
                      <Badge variant="outline">Centered</Badge>
                    </Center>
                  </HStack>
                  <Flex justify="space-between" w="100%">
                    <Button size="sm">Left</Button>
                    <Button size="sm" variant="outline">Center</Button>
                    <Button size="sm" variant="secondary">Right</Button>
                  </Flex>
                </VStack>
              </Box>
            </VStack>
          </CardContent>
        </Card>
      </Box>
      
      {/* Demo Templates Grid */}
      <Grid gap="2rem" style={{ marginBottom: '3rem' }}>
        
        {/* Search Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Search Demo</CardTitle>
            <CardDescription>Simple search with predefined results</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack spacing={1} alignItems="stretch">
              <HStack spacing={0.5}>
                <Input 
                  placeholder="Search for: chicken, salmon, vegetable..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleSearch}>Search</Button>
              </HStack>
              {searchResult && (
                <Badge variant={searchResult.includes("Found") ? "default" : "secondary"}>
                  {searchResult}
                </Badge>
              )}
            </VStack>
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Demo</CardTitle>
            <CardDescription>Buttons for page navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <HStack spacing={0.5} style={{ flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>View Profile</Button>
              <Button variant="secondary" onClick={() => navigate('/stats')}>Check Stats</Button>
            </HStack>
          </CardContent>
        </Card>

        {/* Counter Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Counter Demo</CardTitle>
            <CardDescription>Simple state management example</CardDescription>
          </CardHeader>
          <CardContent>
            <CounterDemo />
          </CardContent>
        </Card>

        {/* Message Count Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Message Count Demo</CardTitle>
            <CardDescription>Get user's message count from API</CardDescription>
          </CardHeader>
          <CardContent>
            <MessageCountDemo />
          </CardContent>
        </Card>

      </Grid>

      <Grid>
        <Card>
            <CardHeader>
                <CardTitle>Hello World</CardTitle>
            </CardHeader>
            <CardContent>
                Hii
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Hello World</CardTitle>
            </CardHeader>
            <CardContent>
                Hii 
            </CardContent>
        </Card>
      </Grid>

      <VStack spacing={1} mt={2}>
        <Button onClick={dummyFunc}>Click me</Button>
        <Button onClick={deleteMessages}>Delete My Messages</Button>
      </VStack>

      {/* Dishes Section */}
      <VStack spacing={1} mt={2}>
        <h2 style={{ fontSize: '1.5rem', color: '#22c55e', marginBottom: '1rem' }}>
          Dish Cards Demo
        </h2>
        <Grid>
          {dishes.map((dish) => (
            <Card key={dish.id}>
              <CardHeader>
                <CardTitle>{dish.name}</CardTitle>
                <CardDescription>{dish.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Flex justify="space-between" align="center">
                  <span>Cooking Time:</span>
                  <Badge variant="secondary">{dish.cookingTime}</Badge>
                </Flex>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </VStack>
      
    </Box>
  );
};

// Simple Counter Component
const CounterDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  
  return (
    <VStack spacing={1}>
      <Center>
        <Box fontSize={2} my={1}>{count}</Box>
      </Center>
      <HStack spacing={0.5}>
        <Button variant="outline" onClick={() => setCount(count - 1)}>-</Button>
        <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
        <Button variant="outline" onClick={() => setCount(count + 1)}>+</Button>
      </HStack>
    </VStack>
  );
};

// Message Count Demo Component
const MessageCountDemo: React.FC = () => {
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessageCount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const count = await profileApi.getMessageCount();
      setMessageCount(count);
      toast({
        title: "Success",
        description: `Message count loaded: ${count}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch message count';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={1}>
      <Center>
        {messageCount !== null && !error && (
          <Box fontSize={2} my={1} color="#22c55e">
            Message Count: {messageCount}
          </Box>
        )}
        {error && (
          <Badge variant="destructive" style={{ marginBottom: '0.5rem' }}>
            Error: {error}
          </Badge>
        )}
      </Center>
      <Button 
        onClick={fetchMessageCount} 
        disabled={isLoading}
        variant={messageCount !== null ? "outline" : "default"}
      >
        {isLoading ? "Loading..." : messageCount !== null ? "Refresh Count" : "Get Message Count"}
      </Button>
    </VStack>
  );
};

export default Demo; 