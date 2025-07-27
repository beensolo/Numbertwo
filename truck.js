import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Canvas and Scene Setup
const canvas = document.querySelector('#canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 25);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lights
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 10);
scene.add(light);

// Pivot for orbit-style rotation
const pivot = new THREE.Object3D();
scene.add(pivot);

// Textures & Mesh Click Targets
const textureLoader = new THREE.TextureLoader();
const clickableMeshes = [];

const loader = new GLTFLoader();
loader.load('ptruck.glb', glb => {
  const model = glb.scene;
  model.position.y = 0.5;
  model.scale.set(1, 1, 1);

  model.traverse(child => {
    if (child.isMesh) {
      if (child.name.toLowerCase() === 'plane') {
        const bakedTexture = textureLoader.load('noise_texture.png');
        child.material = new THREE.MeshBasicMaterial({ map: bakedTexture });
      }

      if (child.name.toLowerCase().includes('truck')) {
        child.name = 'truckButton';
        clickableMeshes.push(child);
      }
    }
  });

  pivot.add(model);
});

// Raycasting for clicks and hover
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

canvas.addEventListener('mousemove', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableMeshes, true);
  const hovering = intersects.some(obj => obj.object.name === 'truckButton');
  document.body.classList.toggle('gun-cursor', hovering);
  document.body.classList.toggle('default-cursor', !hovering);
});

// Mouse drag orbit
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
  rotationX = THREE.MathUtils.clamp(rotationX, 0, 1);

  pivot.rotation.set(rotationX, rotationY, 0);
  prev.x = e.clientX;
  prev.y = e.clientY;
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

canvas.addEventListener('wheel', event => {
  event.preventDefault();
  camera.position.z += event.deltaY * 0.01;
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


// ✅ MINESWEEPER INIT
const gameContainer = document.getElementById('game');
const size = 8;
const mineCount = 10;
const cells = [];
let minePositions = [];

function generateMines() {
  minePositions = [];
  while (minePositions.length < mineCount) {
    const pos = Math.floor(Math.random() * size * size);
    if (!minePositions.includes(pos)) minePositions.push(pos);
  }
}

function getNeighbors(index) {
  const neighbors = [];
  const row = Math.floor(index / size);
  const col = index % size;
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      if (r === 0 && c === 0) continue;
      const nr = row + r;
      const nc = col + c;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        neighbors.push(nr * size + nc);
      }
    }
  }
  return neighbors;
}

function reveal(index) {
  const cell = cells[index];
  if (cell.classList.contains('revealed')) return;
  cell.classList.add('revealed');

  if (minePositions.includes(index)) {
    cell.textContent = '💣';
    alert('Game Over');
    return;
  }

  const count = getNeighbors(index).filter(i => minePositions.includes(i)).length;
  if (count > 0) {
    cell.textContent = count;
  } else {
    getNeighbors(index).forEach(reveal);
  }
}

function initGame() {
  gameContainer.innerHTML = '';
  cells.length = 0;
  generateMines();

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', () => reveal(i));
    gameContainer.appendChild(cell);
    cells.push(cell);
  }
}

initGame();
