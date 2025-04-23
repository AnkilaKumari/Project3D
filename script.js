import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';

let scene, camera, renderer;
let planets = [];
let moons = [];
let labels = {};
let labelVisible = true;
let orbits = [];
let speed = 1;

const planetList = [
  { id: 'earth', moons: [{ name: 'moon', radius: 1737, distance: 384400, color: 0xaaaaaa }] },
  { id: 'mars', moons: [] },
  { id: 'jupiter', moons: [{ name: 'europa', radius: 1560, distance: 670900, color: 0xddddff }] }
];

const API_URL = 'https://api.le-systeme-solaire.net/rest/bodies/';

async function fetchPlanetData(id) {
  const res = await fetch(API_URL + id);
  const data = await res.json();
  return {
    name: data.englishName,
    radius: data.meanRadius || 1000,
    orbitRadius: data.semimajorAxis || 100000,
    period: data.sideralOrbit || 365,
    color: getColor(id),
    moons: planetList.find(p => p.id === id)?.moons || []
  };
}

function getColor(id) {
  const colors = {
    mercury: 0xaaaaaa,
    venus: 0xffcc99,
    earth: 0x3399ff,
    mars: 0xff3300,
    jupiter: 0xffcc66,
    saturn: 0xffff99
  };
  return colors[id] || 0xffffff;
}

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 300, 800);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarCanvas'), antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.PointLight(0xffffff, 2);
  scene.add(light);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius);
  const points = curve.getPoints(100);
  const orbitGeom = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const orbitLine = new THREE.LineLoop(orbitGeom, new THREE.LineBasicMaterial({ color: 0x888888 }));
  orbitLine.rotation.x = Math.PI / 2;
  scene.add(orbitLine);
  orbits.push(orbitLine);
}

function createPlanet(data) {
  const geo = new THREE.SphereGeometry(data.radius / 3000, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: data.color });
  const planet = new THREE.Mesh(geo, mat);
  planet.userData = { ...data, angle: Math.random() * Math.PI * 2 };
  scene.add(planet);
  planets.push(planet);

  createOrbit(data.orbitRadius / 1e6);

  const label = document.createElement('div');
  label.className = 'label';
  label.innerText = data.name;
  document.body.appendChild(label);
  labels[data.name] = { element: label, mesh: planet };

  // Moons
  data.moons.forEach(m => {
    const moonGeo = new THREE.SphereGeometry(m.radius / 10000, 16, 16);
    const moonMat = new THREE.MeshStandardMaterial({ color: m.color });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.userData = { parent: planet, angle: Math.random() * Math.PI * 2, distance: m.distance / 1e4 };
    scene.add(moon);
    moons.push(moon);
  });
}

function updatePositions() {
  planets.forEach(p => {
    p.userData.angle += 0.01 * speed / p.userData.period;
    const r = p.userData.orbitRadius / 1e6;
    p.position.x = Math.cos(p.userData.angle) * r;
    p.position.z = Math.sin(p.userData.angle) * r;
  });

  moons.forEach(m => {
    m.userData.angle += 0.03;
    const parent = m.userData.parent;
    m.position.x = parent.position.x + Math.cos(m.userData.angle) * m.userData.distance;
    m.position.z = parent.position.z + Math.sin(m.userData.angle) * m.userData.distance;
  });
}

function updateLabels() {
  Object.values(labels).forEach(({ element, mesh }) => {
    const projectedPos = mesh.position.clone().project(camera);
    const x = (projectedPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projectedPos.y * 0.5 + 0.5) * window.innerHeight;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.display = labelVisible ? 'block' : 'none';
  });
}

function animate() {
  requestAnimationFrame(animate);
  updatePositions();
  updateLabels();
  renderer.render(scene, camera);
}

function setupUI() {
  document.getElementById('zoomIn').onclick = () => camera.position.z *= 0.9;
  document.getElementById('zoomOut').onclick = () => camera.position.z *= 1.1;
  document.getElementById('resetView').onclick = () => camera.position.set(0, 300, 800);
  document.getElementById('speedSlider').oninput = e => speed = parseFloat(e.target.value);
  document.getElementById('toggleLabels').onclick = () => {
    labelVisible = !labelVisible;
    updateLabels();
  };
  document.getElementById('toggleOrbits').onclick = () => {
    orbits.forEach(o => o.visible = !o.visible);
  };
}

// Launch
(async function start() {
  initScene();
  setupUI();

  for (const p of planetList) {
    const data = await fetchPlanetData(p.id);
    data.moons = p.moons;
    createPlanet(data);
  }

  animate();
})();
