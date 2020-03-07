/* Class for managing interfacing with THREE.js for rendering the game world */

import * as THREE from "../packages/three.module.js"
import {
    OrbitControls
} from '../packages/OrbitControls.js'
import "../packages/simplex-noise.js"

export default class RenderManager {
    constructor(canvas, width = false, height = false) {
        // Setup canvas
        this.viewport = canvas
        this.width = width || document.body.clientWidth
        this.height = height || document.body.clientHeight

        // Three js scene
        this.scene = new THREE.Scene()

        // Setup temp camera
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        this.camera.position.set(16, 62 + 16, 16)

        this.target = new THREE.Vector3(0, 62, 0)

        // Instantiate renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.viewport
        })

        // Configure renderer
        this.renderer.setSize(this.width, this.height)
        // Append renderer to body
        document.body.appendChild(this.renderer.domElement)

        // Temp controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.target = this.target

        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05

        this.controls.screenSpacePanning = false
        this.controls.enableKeys = true
        this.controls.keys = {
            LEFT: 65,
            UP: 87,
            RIGHT: 68,
            BOTTOM: 83
        }

        this.controls.minDistance = 1
        this.controls.maxDistance = 100

        this.controls.maxPolarAngle = Math.PI

        // Setup sky
        this.dayCol = new THREE.Color(0x8ae5ff)
        this.duskCol = new THREE.Color(0x2855b5)
        this.nightCol = new THREE.Color(0x34435E)

        this.scene.background = this.dayCol.clone()

        // Basic lighting
        this.lightCol = new THREE.Color(1, 1, 1)
        this.ambLight = new THREE.AmbientLight(this.lightCol.getHex());
        this.scene.add(this.ambLight);

        // Add fog to scene
        this.scene.fog = new THREE.FogExp2(0x96D1FF, 0.008);

        this.windowResize()
    }

    // Resizes renderer to canvas size and adjusts camera aspect ratio
    windowResize() {
        this.width = document.body.clientWidth
        this.height = document.body.clientHeight

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    }

    // Calculates sky and light based on world time (speed = days per 360 frames)
    doDayNight(player, time, speed = 0.01) {
        const degToRad = Math.PI / 180

        // Map world time to scale of -1 to 1 for night to day 
        let dayNight = Math.cos(degToRad * (time * speed))

        // Adjust ambient light for day and night
        this.ambLight.intensity = (dayNight + 1.1) / 2

        // Calculate sky color for day and night
        let lerpCol = this.duskCol.clone()
        if (dayNight > 0) {
            lerpCol.lerp(this.dayCol, dayNight)
            // timeState = "night"
        } else {
            lerpCol.lerp(this.nightCol, -dayNight)
            // timeState = "day"
        }
        this.scene.background = lerpCol

        // Set sun and moon rotation for day and night
        // player.sunMoon.rotation.x = degToRad * (time * speed + 90)
    }

    // Renders the current scene
    render(worldTime, player) {
        this.doDayNight(player, worldTime)
        this.renderer.render(this.scene, this.camera)
        this.controls.update()
    }
}