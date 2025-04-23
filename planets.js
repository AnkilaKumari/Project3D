import * as THREE from 'three';

export function createCelestialBody(size, texturePath, distance = 0) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const texture = new THREE.TextureLoader().load(texturePath);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const body = new THREE.Mesh(geometry, material);
    
    if(distance > 0) {
        const innerRadius = distance - 0.1;
        const outerRadius = distance + 0.1;
        const segments = 64;

        const orbitGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa, // Orbit color
            side: THREE.DoubleSide, // Render both sides of the ring
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2; // Rotate to lie flat
        scene.add(orbit);
    }
    
    return body;
}

export function createOrbitFromData(scene, orbitalData) {
    const { semiMajorAxis, eccentricity } = orbitalData; // Example parameters
    const orbitGeometry = new THREE.RingGeometry(
        semiMajorAxis * (1 - eccentricity) - 0.1,
        semiMajorAxis * (1 - eccentricity) + 0.1,
        64
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        side: THREE.DoubleSide,
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate to lie flat
    scene.add(orbit);
}

createCelestialBody(1, 'assets/textures/earth.jpg', 10); // Distance = 10

camera.position.set(0, 30, 50);
camera.lookAt(0, 0, 0);