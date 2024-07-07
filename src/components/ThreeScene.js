import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Drone from './Drone';

const ThreeScene = () => {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <Drone position={[0, 0, -20]} />
      <OrbitControls />
    </Canvas>
  );
};

export default ThreeScene;