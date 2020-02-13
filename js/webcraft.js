console.log("Welcome to Webcraft")

// Import packages
import * as THREE from "./packages/three.module.js"
import {
    OrbitControls
} from './packages/OrbitControls.js'
import "./packages/simplex-noise.js"

let cubes = []

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
let scene = new THREE.Scene()
// Three.js camera (FOV, Aspect Ratio, near clipping plain, far clipping plain)
let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

// Setup renderer
let renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)

// Append renderer to body
document.body.appendChild(renderer.domElement)

// Instance orbit controls
let controls = new OrbitControls(camera, renderer.domElement)

controls.enableDamping = true
controls.dampingFactor = 0.05

controls.screenSpacePanning = false
controls.enableKeys = true
controls.keys = {
    LEFT: 65,
    UP: 87,
    RIGHT: 68,
    BOTTOM: 83
}

controls.minDistance = 1
controls.maxDistance = 100

controls.maxPolarAngle = Math.PI

// Setup skybox
let skyLoader = new THREE.CubeTextureLoader()
skyLoader.setPath("../resources/textures/skybox/")
const skybox = skyLoader.load([
    'px.png',
    'nx.png',
    'py.png',
    'ny.png',
    'pz.png',
    'nz.png',
])
scene.background = skybox


// Add light to scene
let light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(-10, 10, 4)
scene.add(light)

camera.position.z = 10
camera.rotation.y = 45 * Math.PI / 180

// FPS counter
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Render loop
function render(time) {
    time *= 0.001 // convert time to seconds

    stats.begin()

    // Window resize
    let canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()

    requestAnimationFrame(render)
    controls.update()
    renderer.render(scene, camera)

    stats.end()
}

// ************** //
// Game Functions //
// ************** //

// Test world gen function
function generate() {
    let width = 16  
    let depth = 16

    let genHeight = 10
    let genSize = 0.01

    // Texture loader
    let loader = new THREE.TextureLoader();
    loader.setPath("../resources/textures/blocks/")

    // Load side, top, and bottom texture
    let sideTex = loader.load('grass_block_side.png')
    let topTex = loader.load('grass_block_top_green.png')
    let botTex = loader.load('dirt.png')

    // Remove re-sampling filter
    sideTex.magFilter = THREE.NearestFilter
    topTex.magFilter = THREE.NearestFilter
    botTex.magFilter = THREE.NearestFilter

    // Create materials
    let materials = [
        new THREE.MeshBasicMaterial({
            map: sideTex
        }),
        new THREE.MeshBasicMaterial({
            map: sideTex
        }),
        new THREE.MeshBasicMaterial({
            map: topTex
        }),
        new THREE.MeshBasicMaterial({
            map: botTex
        }),
        new THREE.MeshBasicMaterial({
            map: sideTex
        }),
        new THREE.MeshBasicMaterial({
            map: sideTex
        }),
    ];


    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            let val = Math.round((simplex.noise2D(x * genSize, z * genSize)) * genHeight)

            let geometry = new THREE.BoxGeometry(1, 1, 1)

            let cube = new THREE.Mesh(geometry, materials)

            cube.position.x = x - width / 2
            cube.position.z = z - depth / 2
            cube.position.y = val

            scene.add(cube)
        }
    }
}

generate()

// Start render loop
render()