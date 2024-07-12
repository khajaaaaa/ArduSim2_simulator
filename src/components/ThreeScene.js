import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js';

const ThreeScene = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let width, height;
    const canvas = canvasRef.current;

    // Initialize Three.js scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvas.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    // Add more lights as needed

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load('/models/dro.glb', (gltf) => {
      const object = gltf.scene;
      scene.add(object);
    });

    // Initial camera position
    camera.position.set(5, 0, 1);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      TWEEN.update();
    };
    animate();

    // Resize handling
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Clean-up
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={canvasRef} />;
};

export default ThreeScene;
