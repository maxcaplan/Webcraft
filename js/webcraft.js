console.log("Welcome to Webcraft")

// Generate alphanumeric world seed
const MAX_SEED_LENGTH = 19
const SEED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456890"
let seed = ""

for (let s = 0; s < MAX_SEED_LENGTH; s++) {
    seed += SEED_CHARS[Math.round(Math.random() * SEED_CHARS.length)]
}

console.log("Your seed is: " + seed)

// Create instance of simplex noise using seed
var simplex = new SimplexNoise(seed)

// Set default scene size
let width = 480
let height = 270

// Set scene size to match body
width = document.body.clientWidth
height = document.body.clientHeight

// Three.js scene
var scene = new THREE.Scene();
// Three.js camera (FOV, Aspect Ratio, near clipping plain, far clipping plain)
var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Setup renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// Append renderer to body
document.body.appendChild(renderer.domElement);

// Create simple cube:
// Create mesh
var geometry = new THREE.BoxGeometry();
// Create material
var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
});
// Create cube object
var cube = new THREE.Mesh(geometry, material);
// Add cube to scene
scene.add(cube);

camera.position.z = 5;


// Render loop
function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();