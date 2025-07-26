import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#canvas');
if (!canvas) throw new Error("Canvas element with id 'canvas' not found");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0, 1.6, 5);
cameraHolder.add(camera);
scene.add(cameraHolder);

let pitch = 0;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 10);
scene.add(light);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x303030 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

let model = null;
const loader = new GLTFLoader();
loader.load('/ptruck.glb', glb => {
  model = glb.scene;
  model.scale.set(1, 1, 1);
  model.position.y = 0.5;
  scene.add(model);
});

const honk = new Audio('/honk1.mp3');
window.addEventListener('click', () => {
  honk.currentTime = 0;
  honk.play().catch(err => console.warn('Honk blocked:', err));
});

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (!isMobile) {
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
} else {
  const joystick = nipplejs.create({
    zone: document.getElementById('joystick-container'),
    mode: 'static',
    position: { left: '50px', bottom: '50px' },
    color: 'white',
  });

  joystick.on('move', (evt, data) => {
    const rad = data.angle.radian;
    joystickDirection.x = Math.cos(rad) * data.force;
    joystickDirection.z = Math.sin(rad) * data.force;
  });

  joystick.on('end', () => {
    joystickDirection.set(0, 0, 0);
  });

  let dragging = false, lastX = 0, lastY = 0;
  window.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      dragging = true;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchmove', e => {
    if (dragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      cameraHolder.rotation.y -= dx * 0.002;
      pitch -= dy * 0.002;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
      camera.rotation.x = pitch;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchend', () => dragging = false);
}

function onMouseMove(e) {
  cameraHolder.rotation.y -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  camera.rotation.x = pitch;
}

const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = true;
});
document.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) keys[key] = false;
});

const moveSpeed = 0.1;
const joystickDirection = new THREE.Vector3();

function updateMovement() {
  let direction = new THREE.Vector3();

  if (isMobile) {
    direction.copy(joystickDirection);
  } else {
    if (keys.w) direction.z -= 1;
    if (keys.s) direction.z += 1;
    if (keys.a) direction.x -= 1;
    if (keys.d) direction.x += 1;
  }

  if (direction.lengthSq() > 0) {
    direction.normalize();
    const yaw = cameraHolder.rotation.y;
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const dx = direction.x * cos + direction.z * sin;
    const dz = -direction.x * sin + direction.z * cos;
    cameraHolder.position.x += dx * moveSpeed;
    cameraHolder.position.z += dz * moveSpeed;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  updateMovement();
 // if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
