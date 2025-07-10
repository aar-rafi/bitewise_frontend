import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid } from '@/components/ui/grid';
import { Box } from '@/components/ui/box';
import { useNavigate } from 'react-router-dom';

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

  return (
    <Box p={2} maxWidth="1200px" mx="auto">
      
      {/* Header */}
      <Box textAlign="center" mb={2}>
        <h1 style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>
          Demo Templates
        </h1>
        <p style={{ color: '#666' }}>Frontend component templates for experimentation</p>
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
            <Box display="flex" gap={0.5} mb={1}>
              <Input 
                placeholder="Search for: chicken, salmon, vegetable..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearch}>Search</Button>
            </Box>
            {searchResult && (
              <Badge variant={searchResult.includes("Found") ? "default" : "secondary"}>
                {searchResult}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Demo</CardTitle>
            <CardDescription>Buttons for page navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <Box display="flex" gap={0.5} flexDirection="row" style={{ flexWrap: 'wrap' }}>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate('/profile')}>View Profile</Button>
              <Button variant="secondary" onClick={() => navigate('/stats')}>Check Stats</Button>
            </Box>
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

      <Box mb={2}></Box>

      <Button onClick={dummyFunc}>Click me</Button>

      <Box mb={2}></Box>
      

      {/* Dishes Section */}
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
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <span>Cooking Time:</span>
                <Badge variant="secondary">{dish.cookingTime}</Badge>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Grid>
      
    </Box>
  );
};

// Simple Counter Component
const CounterDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  
  return (
    <Box textAlign="center">
      <Box fontSize={2} my={1}>{count}</Box>
      <Box display="flex" gap={0.5} justifyContent="center">
        <Button variant="outline" onClick={() => setCount(count - 1)}>-</Button>
        <Button variant="outline" onClick={() => setCount(0)}>Reset</Button>
        <Button variant="outline" onClick={() => setCount(count + 1)}>+</Button>
      </Box>
    </Box>
  );
};

export default Demo; 