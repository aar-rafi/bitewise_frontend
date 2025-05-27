import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface FloatingFood3DProps {
  emoji: string;
  pathIndex: number;
  delay: number;
  speed?: number;
}

const FloatingFood3D: React.FC<FloatingFood3DProps> = ({
  emoji,
  pathIndex,
  delay,
  speed = 0.5,
}) => {
  const meshRef = useRef<THREE.Group>(null);

  // Create different curved paths - diagonal flow
  const path = useMemo(() => {
    const curves = [
      // Path 1 - Top diagonal flowing curve
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, -6, 0),
        new THREE.Vector3(-4, -3, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4, 3, 0),
        new THREE.Vector3(8, 6, 0),
      ]),
      // Path 2 - Middle diagonal flowing curve
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, -4, 0),
        new THREE.Vector3(-4, -2, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4, 2, 0),
        new THREE.Vector3(8, 4, 0),
      ]),
      // Path 3 - Bottom diagonal flowing curve
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8, -2, 0),
        new THREE.Vector3(-4, -1, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(4, 1, 0),
        new THREE.Vector3(8, 2, 0),
      ]),
    ];
    return curves[pathIndex % 3];
  }, [pathIndex]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const adjustedTime = (time * speed + delay) % 10; // 10 second loop
      const t = (adjustedTime / 10) % 1;

      // Get position along the curve
      const position = path.getPoint(t);
      meshRef.current.position.copy(position);

      // Add floating bob motion
      meshRef.current.position.y += Math.sin(time * 2 + delay) * 0.2;

      // Add gentle rotation
      meshRef.current.rotation.z = Math.sin(time + delay) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Text fontSize={1} color="white" anchorX="center" anchorY="middle">
        {emoji}
      </Text>
    </group>
  );
};

export default FloatingFood3D;
