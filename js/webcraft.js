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

let viewport = document.querySelector("#viewport")
let pauseMenu = document.querySelector(".pause")
let unpauseBtn = document.querySelector("#unpause")

const WORLD_SIZE = 5
let renderDistance = 2

let pause = false

let chunks = []
let chunkQueue = []

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

// Handel window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    width = document.body.clientWidth
    height = document.body.clientHeight

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}

// Three.js scene
let scene = new THREE.Scene()
// Three.js camera (FOV, Aspect Ratio, near clipping plain, far clipping plain)
let camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

camera.position.y = 10
camera.rotation.y = 45 * Math.PI / 180

// Setup renderer
let renderer = new THREE.WebGLRenderer({
    canvas: viewport
})
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

// Basic lighting
var ambLight = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambLight);

// Add fog to scene
scene.fog = new THREE.FogExp2(0x96D1FF, 0.02);

// FPS counter
var stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

let geometry = new THREE.BoxBufferGeometry()
let material = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF
})
let cube = new THREE.Mesh(geometry, material)
// cube.position.y = 10
scene.add(cube)

// Render loop
function render(time) {
    if (!pause) {
        time *= 0.001 // convert time to seconds

        stats.begin()

        requestAnimationFrame(render)
        controls.update()
        renderer.render(scene, camera)

        cube.position.x += 0.05

        generateChunks(cube.position.x, cube.position.z)

        stats.end()
    }
}

// Start render loop
render()

// Pause handling
var down = false
window.onkeydown = e => {
    if (down) return

    if (e.keyCode == 27) {
        pause = !pause
        render()
    }

    if (pause) {
        pauseMenu.style.display = "block"
        viewport.style.webkitFilter = "blur(8px)";
        viewport.style.filter - "blur(8px)"
    } else {
        pauseMenu.style.display = "none"
        viewport.style.webkitFilter = "blur(0px)";
        viewport.style.filter - "blur(0px)"
    }

    down = true
}

window.onkeyup = e => {
    if (e.keyCode == 27) {
        down = false
    }
}

unpauseBtn.onclick = e => {
    pause = false

    pauseMenu.style.display = "none"
    viewport.style.webkitFilter = "blur(0px)";
    viewport.style.filter - "blur(0px)"

    render()
}

// **************** //
// World Generation //
// **************** //

function generateChunks(posX, posZ) {
    // Calculate position of cube relative to chunks
    let centerX = Math.round(posX / 16)
    let centerZ = Math.round(posZ / 16)

    for (let x = -renderDistance; x <= renderDistance; x++) {
        for (let z = -renderDistance; z <= renderDistance; z++) {
            let searchX = centerX + x
            let searchZ = centerZ + z

            let search = chunks.find(chunk => {
                return chunk.globalX == searchX && chunk.globalZ == searchZ
            })

            if (search == undefined) {
                chunks.push(new Chunk(searchX, searchZ, 10, simplex, 10, 0.01))
                scene.add(chunks[chunks.length - 1].generateMesh())
            }
        }
    }
}

// Temporary world gen
// chunks.push(new Chunk(0, 0, 10, simplex, 10, 0.01))
// scene.add(chunks[0].generateMesh())
// for (let x = 0; x < WORLD_SIZE; x++) {
//     for (let z = 0; z < WORLD_SIZE; z++) {
//         chunks.push(new Chunk(x - WORLD_SIZE / 2 + 0.5, z - WORLD_SIZE / 2 + 0.5, 10, simplex, 10, 0.01))
//     }
// }

// chunkQueue = chunks.map(chunk => {
//     return new Promise(resolve => resolve(chunk.generateMesh()))
// })

// Promise.all(chunkQueue).then(results => {
//     results.forEach(mesh => {
//         scene.add(mesh)
//     })
// })

// console.log(chunks)

// console.log(promises)

// chunks.forEach(chunk => {
//     let chunkMesh = chunk.generateMesh()
//     scene.add(chunkMesh)
// })