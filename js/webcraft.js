console.log("Welcome to Webcraft")

// Import packages
import * as THREE from "./packages/three.module.js"
import {
    OrbitControls
} from './packages/OrbitControls.js'
import "./packages/simplex-noise.js"

// Import classes
import Player from "./classes/player.js"
import Blocks from "./classes/block.js"
import Chunk from "./classes/chunk.js"

let viewport = document.querySelector("#viewport")
let pauseMenu = document.querySelector(".pause")
let unpauseBtn = document.querySelector("#unpause")

let worldTime = 0
let timeState = "day"

const WORLD_SIZE = 5
let renderDistance = 2

let pause = false

let chunkId = 0
let chunks = []

const degToRad = Math.PI/180

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

let dayCol = new THREE.Color(0x8ae5ff)
let duskCol = new THREE.Color(0x2855b5)
let nightCol = new THREE.Color(0x34435E)

scene.background = dayCol.clone()

// Basic lighting
let lightCol = new THREE.Color(1, 1, 1)
let ambLight = new THREE.AmbientLight(lightCol.getHex());
scene.add(ambLight);

// Add fog to scene
scene.fog = new THREE.FogExp2(0x96D1FF, 0.008);

// FPS counter
let stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Create basic player
let player = new Player(0, 0, 0)
scene.add(player.object)

let direction = true

// Render loop
function render(time) {
    if (!pause) {
        worldTime += 1

        stats.begin()
        doDayNight(worldTime)

        requestAnimationFrame(render)
        controls.update()
        renderer.render(scene, camera)

        // // Move player left and right
        // if(direction) {
        //     if(player.position.x < 50) player.position.x += 0.1
        //     else direction = false
        // } else {
        //     if(player.position.x > -50) player.position.x -= 0.1
        //     else direction = true
        // }

        loadChunks(player.object.position.x, player.object.position.z)

        player.update(camera)

        stats.end()
    }
}

// Start render loop
render()

// Pause handling
let down = false
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

// *************** //
// World Functions //
// *************** //

function loadChunks(posX, posZ) {
    // Calculate position of player relative to chunks
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
                let chunk = new Chunk(searchX, searchZ, 10, simplex, 10, 0.01, chunkId)
                chunks.push(chunk)
                chunkId++

                let mesh = chunk.generateMesh()
                mesh.name = chunk.id
                scene.add(mesh)
            } else if (!search.visible && search.hasMesh) {
                let chunkMesh = scene.getObjectByName(search.id)
                chunkMesh.visible = true
                search.visible = true
            }
        }
    }

    // Check if any chunks are out of render distance
    let distant = chunks.filter(chunk => {
        let distance = Math.sqrt(Math.pow((centerX - chunk.globalX), 2) + Math.pow((centerZ - chunk.globalZ), 2))
        return distance > renderDistance + 1
    })

    // Hide chunks that are out of render distance
    distant.forEach(chunk => {
        if (chunk.visible && chunk.hasMesh) {
            let chunkMesh = scene.getObjectByName(chunk.id)
            chunkMesh.visible = false
            chunk.visible = false
        }
    })
}

// Calculates sky and light based on world time (speed = days per 360 frames)
function doDayNight(time, speed = 0.01) {
    // Map world time to scale of -1 to 1 for night to day 
    let dayNight = Math.cos(degToRad * (time * speed))

    // Adjust ambient light for day and night
    ambLight.intensity = (dayNight + 1.1) / 2

    // Calculate sky color for day and night
    let lerpCol = duskCol.clone()
    if (dayNight > 0) {
        lerpCol.lerp(dayCol, dayNight)
        timeState = "night"
    } else {
        lerpCol.lerp(nightCol, -dayNight)
        timeState = "day"
    }
    scene.background = lerpCol

    // Set sun and moon rotation for day and night
    player.sunMoon.rotation.x = degToRad * (time * speed + 90)

}

// Legacy world gen
// chunks.push(new Chunk(0, 0, 10, simplex, 10, 0.01))
// scene.add(chunks[0].generateMesh())
// for (let x = 0; x < WORLD_SIZE; x++) {
//     for (let z = 0; z < WORLD_SIZE; z++) {
//         chunks.push(new Chunk(x - WORLD_SIZE / 2 + 0.5, z - WORLD_SIZE / 2 + 0.5, 10, simplex, 10, 0.01))
//     }
// }

// chunks.forEach(chunk => {
//     let chunkMesh = chunk.generateMesh()
//     scene.add(chunkMesh)
// })