import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';

const Drone = ({ position }) => {
  const mesh = useRef();
  const obj = useLoader(OBJLoader, '/models/CesiumDrone/uploads_files_3653841_Drone_Ob.obj');

  useEffect(() => {
    mesh.current.position.set(...position);
  }, [position]);

  useFrame(() => {
    mesh.current.position.z += 0.1; // Move forward
    mesh.current.rotation.y += 0.01; // Rotate
  });

  return <primitive object={obj} ref={mesh} />;
};

export default Drone;