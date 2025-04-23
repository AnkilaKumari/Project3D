import * as THREE from 'three';

export function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const planets = [];
  const orbitLines = [];

  // Add orbits
  const distances = [10, 20, 30, 40]; // Example distances for orbits
  distances.forEach(distance => {
    const orbitGeometry = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie flat
    scene.add(orbit);
    orbitLines.push(orbit);
  });

  return { scene, camera, renderer, planets, orbitLines };
}

export function animate(scene, camera, renderer, planets) {
  function loop() {
    requestAnimationFrame(loop);
    planets.forEach(p => {
      p.userData.angle += 0.01 * (window.speed || 1);
      p.position.x = p.userData.radius * Math.cos(p.userData.angle);
      p.position.z = p.userData.radius * Math.sin(p.userData.angle);
    });
    renderer.render(scene, camera);
  }
  loop();
}

function addOrbitLabel(scene, text, position) {
  const div = document.createElement('div');
  div.className = 'orbit-label';
  div.textContent = text;
  div.style.position = 'absolute';
  div.style.left = `${position.x}px`;
  div.style.top = `${position.y}px`;
  document.body.appendChild(div);
}