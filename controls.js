export function setupControls(planets, camera, renderer) {
    const infoPanel = document.getElementById('infoPanel');
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Event listeners
    document.getElementById('toggleOrbits').addEventListener('click', () => {
        planets.forEach(planet => {
            planet.children[0].visible = !planet.children[0].visible;
        });
    });

    document.getElementById('resetCamera').addEventListener('click', () => {
        camera.position.set(0, 30, 50);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
    });

    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);
        
        if(intersects.length > 0) {
            const planet = intersects[0].object;
            infoPanel.innerHTML = `
                <h3>${planet.name}</h3>
                <p>Distance from Sun: ${planet.position.length().toFixed(1)} AU</p>
                <p>Diameter: ${planet.geometry.parameters.radius * 2} units</p>
            `;
            infoPanel.classList.remove('hidden');
        }
    });
}