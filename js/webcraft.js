console.log("Welcome to Webcraft")

// Import packages
import * as THREE from "./packages/three.module.js"
import "./packages/simplex-noise.js"

// Generate alphanumeric world seed
const MAX_SEED_LENGTH = 19
const SEED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456890"
let seed = ""

for (let s = 0; s < MAX_SEED_LENGTH; s++) {
    seed += SEED_CHARS[Math.round(Math.random() * SEED_CHARS.length)]
}

console.log("Your seed is: " + seed)

// Create instance of simplex noise using seed
let simplex = new SimplexNoise(seed)

// Set default scene size
let width = 480
let height = 270

// Set scene size to match body
width = document.body.clientWidth
height = document.body.clientHeight


// ************** //
// Three js setup //
// ************** //

// Three.js scene
let scene = new THREE.Scene();
// Three.js camera (FOV, Aspect Ratio, near clipping plain, far clipping plain)
let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Setup renderer
let renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// Append renderer to body
document.body.appendChild(renderer.domElement);

// Setup skybox
let loader = new THREE.CubeTextureLoader();
const texture = loader.load([
    '../resources/textures/skybox/px.png',
    '../resources/textures/skybox/nx.png',
    '../resources/textures/skybox/py.png',
    '../resources/textures/skybox/ny.png',
    '../resources/textures/skybox/pz.png',
    '../resources/textures/skybox/nz.png',
]);
scene.background = texture;


// Create simple cube:
// Create geometry
let geometry = new THREE.BoxGeometry(3, 3, 3);
// Create material
let material = new THREE.MeshPhongMaterial({
    color: 0x00ff00
});
// Create cube mesh
let cube = new THREE.Mesh(geometry, material);
// Add cube to scene
scene.add(cube);

// Add light to scene
let light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(-1, 2, 4);
scene.add(light);

camera.position.z = 5;

// FPS counter
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Render loop
function render(time) {
    time *= 0.001; // convert time to seconds

    stats.begin();

    cube.rotation.x = time;
    cube.rotation.y = time;

    // Window resize
    let canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();

    requestAnimationFrame(render);
    renderer.render(scene, camera);

    stats.end();
}

// ************** //
// Game Functions //
// ************** //

// Test world gen function
function generate() {

}


// Start render loop
render();