import React from 'react';

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

// Simple reusable components
const Container = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
    {children}
  </div>
);

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
    <h1 style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '0.5rem' }}>
      {title}
    </h1>
    <p style={{ color: '#666' }}>{subtitle}</p>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '1.5rem' 
  }}>
    {children}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{ 
    fontSize: '1.2rem', 
    margin: '0 0 1rem 0', 
    color: '#333',
    borderBottom: '2px solid #22c55e',
    paddingBottom: '0.5rem'
  }}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p style={{ color: '#666', lineHeight: '1.5', margin: '0 0 1rem 0' }}>
    {children}
  </p>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    backgroundColor: '#f0f9ff',
    color: '#22c55e',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.9rem',
    fontWeight: '500'
  }}>
    {children}
  </span>
);

const Demo: React.FC = () => {
  return (
    <Container>
      <Header 
        title="Demo Page" 
        subtitle="Simple dish showcase for experimentation" 
      />
      
      <Grid>
        {dishes.map((dish) => (
          <Card key={dish.id}>
            <CardTitle>{dish.name}</CardTitle>
            <CardDescription>{dish.description}</CardDescription>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666' }}>Cooking Time:</span>
              <Badge>{dish.cookingTime}</Badge>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default Demo; 