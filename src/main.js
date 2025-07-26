import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// === Canvas ===
const canvas = document.querySelector('#canvas');
if (!canvas) throw new Error("Canvas element with id 'canvas' not found");

// === Scene ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// === Camera and Holder (for FPS yaw/pitch control) ===
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0, 10, 19);
cameraHolder.add(camera);
scene.add(cameraHolder);

let pitch = 0;

// === Renderer ===
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// === Lighting ===
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 10);
scene.add(light);

// === Ground ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x303030 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// === Load Model ===
let model = null;
const loader = new GLTFLoader();
loader.load(
  '/ptruck.glb',
  glb => {
    model = glb.scene;
    model.scale.set(1, 1, 1);
    model.position.y = 5; // ✅ Lift above ground
    scene.add(model);
  },
  xhr => console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`),
  error => console.error('Error loading model:', error)
);

// === Honk Sound ===
const honk = new Audio('/honk1.mp3');
window.addEventListener('click', () => {
  honk.currentTime = 0;
  honk.play().catch(err => {
    console.warn('Honk blocked until user interacts:', err);
  });
});

// === Pointer Lock (Mouse Look) ===
document.body.addEventListener('click', () => {
  document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === document.body) {
    document.addEventListener('mousemove', onMouseMove);
  } else {
    document.removeEventListener('mousemove', onMouseMove);
  }
});

function onMouseMove(event) {
  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  cameraHolder.rotation.y -= movementX * 0.002;

  pitch -= movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  camera.rotation.x = pitch;
}

// === WASD Movement ===
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = true;
});

document.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

const moveSpeed = 0.1;

function updateMovement() {
  const direction = new THREE.Vector3();

  if (keys.w) direction.z -= 1;
  if (keys.s) direction.z += 1;
  if (keys.a) direction.x -= 1;
  if (keys.d) direction.x += 1;

  if (direction.lengthSq() > 0) {
    direction.normalize();

    const yaw = cameraHolder.rotation.y;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);

    // ✅ Correct direction relative to yaw
    const dx = direction.x * cos + direction.z * sin;
    const dz = -direction.x * sin + direction.z * cos;

    cameraHolder.position.x += dx * moveSpeed;
    cameraHolder.position.z += dz * moveSpeed;
  }
}

// === Handle Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animate Loop ===
function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  //if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
