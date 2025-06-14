
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import FloatingFood3D from './FloatingFood3D';

const FloatingFoodAnimation3D = () => {
  const foodItems = [
    { emoji: '🥕', delay: 0, path: 0 },
    { emoji: '🍎', delay: 1, path: 1 },
    { emoji: '🥬', delay: 2, path: 2 },
    { emoji: '🍊', delay: 0.5, path: 0 },
    { emoji: '🥦', delay: 1.5, path: 1 },
    { emoji: '🍌', delay: 2.5, path: 2 },
    { emoji: '🍇', delay: 3, path: 0 },
    { emoji: '🥒', delay: 3.5, path: 1 },
    { emoji: '🍑', delay: 4, path: 2 },
    { emoji: '🥝', delay: 4.5, path: 0 },
    { emoji: '🌽', delay: 5, path: 1 },
    { emoji: '🍓', delay: 5.5, path: 2 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        
        {foodItems.map((item, index) => (
          <FloatingFood3D
            key={index}
            emoji={item.emoji}
            pathIndex={item.path}
            delay={item.delay}
            speed={0.3}
          />
        ))}
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};

export default FloatingFoodAnimation3D;
