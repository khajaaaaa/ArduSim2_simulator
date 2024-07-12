// src/components/ThreeDModelComponent.jsx

import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import TWEEN from '@tweenjs/tween.js';

import './ThreeScene.css'; // Assuming you have a CSS file for styling

const ThreeDModelComponent = () => {
    useEffect(() => {
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Create a Three.js Scene
        const scene = new THREE.Scene();

        // Create a Perspective Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(5, 0, 1);

        // Add lights to the scene
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 0);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const light1 = new THREE.PointLight(0xc4c4c4, 10);
        light1.position.set(0, 300, 500);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xc4c4c4, 10);
        light2.position.set(500, 100, 0);
        scene.add(light2);

        const light3 = new THREE.PointLight(0xc4c4c4, 10);
        light3.position.set(0, 100, -500);
        scene.add(light3);

        const light4 = new THREE.PointLight(0xc4c4c4, 10);
        light4.position.set(-500, 300, 500);
        scene.add(light4);

        // Create a WebGLRenderer
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(width, height);

        // Append renderer to the DOM
        const canvasContainer = document.getElementById('threejs-container');
        canvasContainer.appendChild(renderer.domElement);

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);

        // Load 3D model
        const loader = new GLTFLoader();
        loader.load(
            'models/dro.glb',
            function (gltf) {
                const object = gltf.scene;
                scene.add(object);
            },
            undefined,
            function (error) {
                console.error(error);
            }
        );

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            TWEEN.update();
        }
        animate();

        // Handle window resize
        window.addEventListener("resize", function () {
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });

        return () => {
            // Clean up resources
            window.removeEventListener("resize");
        };
    }, []);

    return (
        <div className="threejs-scene">
            <div id="threejs-container"></div>
        </div>
    );
};

export default ThreeDModelComponent;
