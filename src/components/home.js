import React, { useEffect } from 'react';
import './home.css';
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.5.0/dist/tween.esm.js';

const CarInfo = () => {
  useEffect(() => {
    const canvasContainer = document.getElementById('dCanvasContainer');
    const canvas = document.createElement('canvas');
    canvas.id = 'dCanvas';
    canvasContainer.appendChild(canvas);

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 0, 1);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(width, height);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const lights = [];
    lights[0] = new THREE.PointLight(0xc4c4c4, 10, 0);
    lights[1] = new THREE.PointLight(0xc4c4c4, 10, 0);
    lights[2] = new THREE.PointLight(0xc4c4c4, 10, 0);
    lights[3] = new THREE.PointLight(0xc4c4c4, 10, 0);

    lights[0].position.set(0, 300, 500);
    lights[1].position.set(500, 100, 0);
    lights[2].position.set(0, 100, -500);
    lights[3].position.set(-500, 300, 500);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);
    scene.add(lights[3]);

    const loader = new GLTFLoader();
    loader.load(
      '/models/dro.glb',
      function (gltf) {
        console.log('Model loaded successfully');
        const object = gltf.scene;
        object.scale.set(6.5, 6.5, 6.5);
        object.position.set(0, 0, 0);

        scene.add(object);

        camera.position.set(5, 2, 5);
        camera.lookAt(object.position);

        renderer.render(scene, camera);
      },
      undefined,
      function (error) {
        console.error('An error happened while loading the model', error);
      }
    );

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      TWEEN.update();
    }
    animate();

    window.addEventListener('resize', () => {
      width = canvasContainer.clientWidth;
      height = canvasContainer.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    const btnShowMore = document.getElementById('showmore');
    const slider = document.querySelector('.slider');
    let statusContent = 'contentOne';

    function runCamera(x, y, z) {
      const targetPosition = new THREE.Vector3(x, y, z);
      const duration = 1200;
      const tween = new TWEEN.Tween(camera.position)
        .to(targetPosition, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          camera.lookAt(scene.position);
          renderer.render(scene, camera);
        })
        .start();
    }

    btnShowMore.onclick = () => {
      slider.classList.remove('contentOneAction');
      slider.classList.remove('contentTwoAction');
      switch (statusContent) {
        case 'contentOne':
          runCamera(3, 0, 1);
          statusContent = 'contentTwo';
          slider.classList.add('contentTwoAction');
          break;
        case 'contentTwo':
          runCamera(2, 3, 1);
          statusContent = 'fullScreen';
          break;
        case 'fullScreen':
          runCamera(5, 0, 1);
          slider.classList.add('contentOneAction');
          statusContent = 'contentOne';
          break;
        default:
          break;
      }
    };
  }, []);

  return (
    <div>
      <header>
        <div></div>
        <div></div>
      </header>
      <div className="slider contentOneAction">
        <div id="dCanvasContainer" style={{ width: '100%', height: '100vh' }}></div>
        <div className="contentOne">
          <h1>SF90 STRADALE</h1>
          <div className="des">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aperiam mollitia, voluptates nobis magnam similique enim nisi consectetur. Saepe neque qui facilis quasi ea dolorem soluta vel commodi nesciunt consequatur, aperiam voluptatem nam, mollitia nisi. Ea beatae totam distinctio perspiciatis esse.
          </div>
        </div>
        <div className="contentTwo">
          <ul>
            <li>
              <span>V8</span>
              <span>ENGINE</span>
            </li>
            <li>
              <span>2.5 sec</span>
              <span>0-100 KM/H</span>
            </li>
            <li>
              <span>2120 kW</span>
              <span>EDRIVE POWER</span>
            </li>
            <li>
              <span>1000 cv</span>
              <span>MAXIMUM POWER @ 7500 RPM</span>
            </li>
          </ul>
        </div>
        <button id="showmore">Show more</button>
      </div>
    </div>
  );
};

export default CarInfo;
