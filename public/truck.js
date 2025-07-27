import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('#canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 25);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 10);
scene.add(light);

// Pivot for rotating around the truck
const pivot = new THREE.Object3D();
scene.add(pivot);

const textureLoader = new THREE.TextureLoader();
const clickableMeshes = [];

const loader = new GLTFLoader();
loader.load('/ptruck.glb', glb => {
  const model = glb.scene;
  model.position.y = 0.5;
  model.scale.set(1, 1, 1);

  model.traverse(child => {
    if (child.isMesh) {
      // ✅ Add texture to Plane
      if (child.name.toLowerCase() === 'plane') {
        const bakedTexture = textureLoader.load('/noise_texture.png');
        child.material = new THREE.MeshBasicMaterial({ map: bakedTexture });
      }

      // ✅ Add only "truck" mesh to clickable list
      if (child.name.toLowerCase().includes('truck')) {
        child.name = 'truckButton';
        clickableMeshes.push(child);
      }
    }
  });

  pivot.add(model);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ✅ Click to navigate
canvas.addEventListener('click', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableMeshes, true);

  for (const obj of intersects) {
    if (obj.object.name === 'truckButton') {
      window.location.href = 'box.html';
      return;
    }
  }
});

// ✅ Hover effect cursor
canvas.addEventListener('mousemove', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableMeshes, true);

  const hoveringTruck = intersects.some(obj => obj.object.name === 'truckButton');
  document.body.classList.toggle('gun-cursor', hoveringTruck);
  document.body.classList.toggle('default-cursor', !hoveringTruck);
});

// ✅ Click-and-drag rotation with limited up/down
let isDragging = false;
let prev = { x: 0, y: 0 };
let rotationY = 0;
let rotationX = 0;

canvas.addEventListener('mousedown', e => {
  isDragging = true;
  prev.x = e.clientX;
  prev.y = e.clientY;
});

canvas.addEventListener('mousemove', e => {
  if (!isDragging) return;

  const deltaX = e.clientX - prev.x;
  const deltaY = e.clientY - prev.y;

  rotationY -= deltaX * 0.01;
  rotationX += deltaY * 0.005;
  rotationX = THREE.MathUtils.clamp(rotationX, 0, 1); // limit up/down

  pivot.rotation.set(rotationX, rotationY, 0);

  prev.x = e.clientX;
  prev.y = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

// ✅ Mouse wheel zoom
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const zoomSpeed = 1;
  camera.position.z += event.deltaY * 0.01 * zoomSpeed;
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, 5, 100);
}, { passive: false });

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
