import { planets } from './planets.js'; 
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load('/space.jpg');
 // Path to your image
scene.background = backgroundTexture;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

createStars();

const planetsMeshes = []; // Array to store planet meshes
const labels = []; // Array to store label elements

planets.forEach(planet => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData = {
        name: planet.name,
        size: planet.size,
        period: planet.period,
        funFact: planet.funFact
    };

    scene.add(mesh);
    planetsMeshes.push(mesh);

    // Create a label for the planet
    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label';
    labelDiv.textContent = planet.name;
    labelDiv.style.position = 'absolute';
    labelDiv.style.color = 'white';
    labelDiv.style.display = 'none'; // Hidden by default
    document.body.appendChild(labelDiv);

    labels.push({ element: labelDiv, planetMesh: mesh });
});

function updateLabels() {
    labels.forEach(label => {
        const vector = new THREE.Vector3();
        vector.copy(label.planetMesh.position);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

        label.element.style.left = `${x}px`;
        label.element.style.top = `${y}px`;
    });
}

let showLabels = false;

document.getElementById('toggleLabels').onclick = () => {
    showLabels = !showLabels;
    labels.forEach(label => {
        label.element.style.display = showLabels ? 'block' : 'none';
    });
};

// Create orbits
const orbitLines = [];

planets.forEach(planet => {
    const orbitPoints = new THREE.EllipseCurve(
        0, 0,
        planet.distance,
        planet.distance * 0.98,
        0, 2 * Math.PI,
        false
    ).getPoints(100);

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.Line(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: 0x666666 })
    );
    orbitLine.rotation.x = Math.PI / 2;

    scene.add(orbitLine);
    orbitLines.push(orbitLine);
});

// Raycaster and mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add click listener
window.addEventListener('click', onClick, false);

function onClick(event) {
    // Update camera matrix
    camera.updateMatrixWorld();

    // Normalize mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set raycaster from camera and mouse
    raycaster.setFromCamera(mouse, camera);

    // Intersect with all planet meshes
    const intersects = raycaster.intersectObjects(planetsMeshes, true); // 'true' to check children

    if (intersects.length > 0) {
        const planetMesh = intersects[0].object;
        const planetData = planetMesh.userData;

        if (planetData) {
            showpopup(planetData, planetMesh);
        } else {
            console.warn('No userData found on clicked object.');
        }
    }
}

window.addEventListener('click', onClick);

function showpopup(planet, planetMesh) {
    const popup = document.getElementById('popup');
    const title = document.getElementById('popup-title');
    const diameter = document.getElementById('popup-diameter');
    const period = document.getElementById('popup-period');
    const facts = document.getElementById('popup-facts');

    // Populate the popup with planet data
    title.textContent = planet.name;
    diameter.textContent = `Diameter: ${planet.size * 2} units`;
    period.textContent = `Orbital Period: ${planet.period} days`;
    facts.textContent = `Fun Fact: ${planet.funFact || 'No fun fact available.'}`;

    // Convert the planet's 3D position to 2D screen coordinates
    const vector = new THREE.Vector3();
    vector.copy(planetMesh.position);
    vector.project(camera);

    // Calculate the screen position
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

    // Position the popup near the planet
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.transform = 'translate(-50%, -50%)'; // Center the popup
    popup.style.display = 'block';
}

// Add a close button handler
document.getElementById('popup-close').onclick = () => {
    document.getElementById('popup').style.display = 'none';
};

// Animation variables
let speed = 1; // Default speed
let showOrbits = true;

document.getElementById('toggleOrbits').onclick = () => {
    showOrbits = !showOrbits;
    orbitLines.forEach(line => line.visible = showOrbits);
};

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    planetsMeshes.forEach((mesh, i) => {
        const time = Date.now() * 0.001;
        mesh.position.x = Math.cos(time / planets[i].period * speed) * planets[i].distance;
        mesh.position.z = Math.sin(time / planets[i].period * speed) * planets[i].distance * 0.98;

        mesh.rotation.y += 0.01 * speed;
    });

    updateLabels(); // Update label positions
    renderer.render(scene, camera);
    controls.update();
}

animate();

// UI functionality
document.getElementById('zoomIn').onclick = () => camera.position.z *= 0.9;
document.getElementById('zoomOut').onclick = () => camera.position.z *= 1.1;
document.getElementById('resetView').onclick = () => camera.position.set(0, 40, 40);
document.getElementById('timeline').oninput = (event) => {
    speed = parseFloat(event.target.value); // Update speed based on slider value
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
document.getElementById('popup-close').onclick = () => {
  document.getElementById('popup').style.display = 'none';
};

window.showpopup = showpopup;


