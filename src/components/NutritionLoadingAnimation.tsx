import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Float } from '@react-three/drei';
import { Progress } from '@/components/ui/progress';
import { Leaf, Heart, Zap } from 'lucide-react';

// 3D Food Item Component
const FloatingFoodItem = ({ emoji, position, rotationSpeed = 1, floatSpeed = 1 }: {
  emoji: string;
  position: [number, number, number];
  rotationSpeed?: number;
  floatSpeed?: number;
}) => {
  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      position={position}
    >
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial transparent opacity={0} />
        <Html distanceFactor={10}>
          <div style={{ 
            fontSize: '2rem', 
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}>
            {emoji}
          </div>
        </Html>
      </mesh>
    </Float>
  );
};

// Import Html from drei
import { Html } from '@react-three/drei';

const NutritionLoadingAnimation = ({ 
  message = "Preparing your nutrition dashboard...", 
  progress = 0,
  showProgress = false 
}: {
  message?: string;
  progress?: number;
  showProgress?: boolean;
}) => {
  const nutritionFacts = [
    "🥕 Carrots boost vitamin A",
    "🥬 Leafy greens power iron",
    "🍎 Apples provide fiber",
    "🥦 Broccoli delivers vitamin C",
    "🍌 Bananas fuel potassium",
    "🍓 Berries fight antioxidants"
  ];

  const foodItems = [
    { emoji: '🥕', position: [-3, 2, 0] as [number, number, number] },
    { emoji: '🍎', position: [3, 2, 0] as [number, number, number] },
    { emoji: '🥬', position: [-3, -2, 0] as [number, number, number] },
    { emoji: '🥦', position: [3, -2, 0] as [number, number, number] },
    { emoji: '🍌', position: [0, 3, 0] as [number, number, number] },
    { emoji: '🍓', position: [0, -3, 0] as [number, number, number] },
    { emoji: '🍊', position: [-2, 0, 0] as [number, number, number] },
    { emoji: '🥝', position: [2, 0, 0] as [number, number, number] },
  ];

  const [currentFactIndex, setCurrentFactIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % nutritionFacts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 backdrop-blur-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(34,197,94,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(16,185,129,0.3),transparent_50%)]" />
      </div>

      {/* 3D Food Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {foodItems.map((item, index) => (
            <FloatingFoodItem
              key={index}
              emoji={item.emoji}
              position={item.position}
              rotationSpeed={0.5 + index * 0.1}
              floatSpeed={1 + index * 0.2}
            />
          ))}
          
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo Area */}
        <div className="mb-8 animate-pulse">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-nutrition-green/30 to-nutrition-emerald/30 rounded-full mb-4 shadow-lg backdrop-blur-sm border border-green-500/20">
            <img src="/logo2.png" alt="Bitewise Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent text-center">
            BITEWISE
          </h1>
        </div>

        {/* Pulsing Nutrition Icon */}
        <div className="relative mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-nutrition-green to-nutrition-emerald rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 w-16 h-16 bg-nutrition-green/30 rounded-full animate-ping" />
          <div className="absolute inset-0 w-16 h-16 bg-nutrition-emerald/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Loading Message */}
        <div className="text-center mb-8 max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
          
          {/* Cycling Nutrition Facts */}
          <div className="h-8 overflow-hidden">
            <div 
              className="transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentFactIndex * 2}rem)` }}
            >
              {nutritionFacts.map((fact, index) => (
                <p key={index} className="text-gray-600 h-8 flex items-center justify-center font-medium">
                  {fact}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar (if enabled) */}
        {showProgress && (
          <div className="w-full max-w-md mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Loading nutrition data</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-green-100" 
            />
          </div>
        )}

        {/* Feature Icons */}
        <div className="flex space-x-8 opacity-60">
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0s' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md mb-2">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Track</span>
          </div>
          
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.2s' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md mb-2">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Health</span>
          </div>
          
          <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0.4s' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-full flex items-center justify-center shadow-md mb-2">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Energy</span>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2 mt-8">
          <div className="w-2 h-2 bg-nutrition-green rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-nutrition-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-nutrition-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default NutritionLoadingAnimation; 