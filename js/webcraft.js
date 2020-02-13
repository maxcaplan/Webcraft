console.log("Welcome to Webcraft")

// Import packages
import * as THREE from "./packages/three.module.js"
import {
    OrbitControls
} from './packages/OrbitControls.js'
import "./packages/simplex-noise.js"


// Import classes
import Blocks from "./classes/block.js"
import Chunk from "./classes/chunk.js"
import Block from "./classes/block.js"

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
let width = 780
let height = 580

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


// Add lights to scene
let dirLight = new THREE.DirectionalLight(0xFFFFFF, 1)
dirLight.position.set(-10, 10, 4)
scene.add(dirLight)

var ambLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambLight);

camera.position.z = 10
camera.rotation.y = 45 * Math.PI / 180

// Add fog to scene
scene.fog = new THREE.FogExp2( 0x96D1FF, 0.025 );

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


// Test multi chunk gen
let chunks = [
    new Chunk(0, 0, 24, simplex, 10, 0.01),
    // new Chunk(1, 0, simplex, 10, 0.01),
    // new Chunk(1, 1, simplex, 10, 0.01),
    // new Chunk(0, 1, simplex, 10, 0.01)
]

chunks.forEach(chunk => {
    let chunkMesh = chunk.generateMesh()

    chunkMesh.forEach(block => {
        scene.add(block)
    })
})

// let loader = new THREE.TextureLoader();
// loader.setPath("../resources/textures/blocks/")

// // Load side, top, and bottom texture
// let sideTex = loader.load('grass_block_side.png')
// let topTex = loader.load('grass_block_top_green.png')
// let botTex = loader.load('dirt.png')

// let testBlock = new Block(0, 0, 0, 1, [sideTex, topTex, botTex])
// scene.add(testBlock.generateMesh())

// Start render loop
render()