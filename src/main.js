import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// === Canvas ===
const canvas = document.querySelector('#canvas');
if (!canvas) throw new Error("Canvas element with id 'canvas' not found");

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// === Camera ===
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(2, 5, 20);

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// === Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// === Light ===
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(2, 2, 5);
scene.add(light);

// === Load Model ===
let model = null;

const loader = new GLTFLoader();
loader.load(
  '/ptruck.glb', // must be in "public/" folder
  glb => {
    console.log('Loaded GLB:', glb);
    model = glb.scene;
    model.scale.set(1, 1, 1);
    scene.add(model);
  },
  xhr => {
    console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
  },
  error => {
    console.error('An error occurred loading the model:', error);
  }
);

// === Animate ===
function animate() {
  requestAnimationFrame(animate);

  if (model) model.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


const honk = new Audio('/honk1.mp3');

// Add click listener
window.addEventListener('click', () => {
    honk.currentTime = 0; // rewind to start
    honk.play().catch(err => {
        console.warn('Honk blocked by browser until user interaction:', err);
    });
});