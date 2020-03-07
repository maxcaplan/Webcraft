import * as THREE from "../packages/three.module.js"

import * as config from "../config.js"

export default class player {
    constructor(x = 0, y = 0, z = 0) {
        this.spawn = {
            x: x,
            y: y,
            z: z
        }

        this.node = new THREE.Object3D()

        this.node.position.x = x
        this.node.position.y = y
        this.node.position.z = z

        this.mesh

        this.rayCaster

        this.camera
        this.light

        // TODO: move sun and moon out of player class
        this.sunMoon

        // Physics
        this.GRAVITY = 0.2
        this.MAXFALLSPEED = 1
        this.velocity = {
            x: 0,
            y: 0,
            z: 0
        }
        this.acceleration = 0
        this.direction = 0

        this.grounded = false

        this.constructPlayer()
    }

    constructPlayer() {
        // Create player model mesh
        let geometry = new THREE.BoxBufferGeometry(config.playerConf.width, config.playerConf.height, config.playerConf.depth)
        let material = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF
        })
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.name = "Player"

        // Create player light
        this.light = new THREE.PointLight(0xffffff, 0.5, 10);

        // Create collision raycaster
        this.rayCaster = new THREE.Raycaster(this.node.position, new THREE.Vector3(0, -1, 0))

        // // Create sun and moon axis
        // this.sunMoon = new THREE.Object3D()

        // // Create sun
        // let sunGeo = new THREE.PlaneBufferGeometry(20, 20, 20)
        // let sunMat = new THREE.MeshBasicMaterial({
        //     color: 0xffe854,
        //     fog: false
        // })
        // let sunMesh = new THREE.Mesh(sunGeo, sunMat)
        // sunMesh.name = "sun"
        // sunMesh.position.z = -200

        // // Create moon
        // let moonGeo = new THREE.PlaneBufferGeometry(20, 20, 20)
        // let moonMat = new THREE.MeshBasicMaterial({
        //     color: 0xf7fcff,
        //     fog: false
        // })
        // let moonMesh = new THREE.Mesh(moonGeo, moonMat)
        // moonMesh.name = "moon"
        // moonMesh.position.z = 200
        // moonMesh.rotation.x = Math.PI

        // Add sun and moon to axis
        // this.sunMoon.add(sunMesh)
        // this.sunMoon.add(moonMesh)

        // Add objects to player object
        this.node.add(this.mesh)
        this.node.add(this.light)
        // this.node.add(this.sunMoon)
    }

    // Applies movement input to player physics
    move() {
        return
    }

    // Checks if player is colliding with an active block
    checkCollisions(chunks) {
        let collisions = {
            x: false,
            y: false,
            z: false
        }

        let playerPos = {
            x: this.node.position.x,
            y: this.node.position.y,
            z: this.node.position.z
        }

        this.rayCaster.set(new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z), new THREE.Vector3(0, -1, 0))

        // Check which chunk the player is in
        let chunkPos = {
            x: playerPos.x / config.chunkConf.size,
            z: playerPos.z / config.chunkConf.size
        }

        let currentChunk = chunks.find(chunk => {
            return chunk.chunkX == chunkPos.x && chunk.chunkZ == chunkPos.z
        })

        // Cast a ray downwards to see if player has collided with the ground
        let castColls = []
        if (currentChunk && currentChunk.activeMesh) castColls = this.rayCaster.intersectObject(currentChunk.mesh)

        if (castColls.length > 0) {
            // If collided with ground remove y velocity
            if (castColls[0].distance <= config.playerConf.height / 2) {
                this.grounded = true
                if (this.velocity.y != 0) this.velocity.y = 0
                this.node.position.y = castColls[0].point.y + (config.playerConf.height / 2)
            } else {
                this.grounded = false
            }
        } else {
            this.grounded = false
        }
    }

    // Updates player physics each frame
    update(camera, chunks, checkColls = true) {
        // Check collisions before calculating physics
        let collisions
        if (checkColls) collisions = this.checkCollisions(chunks)

        const degToRad = Math.PI / 180

        // Add velocity to position
        this.node.translateX(this.velocity.x)
        this.node.translateY(this.velocity.y)
        this.node.translateZ(this.velocity.z)

        // Add acceleration to velocity
        this.velocity.x += Math.cos(this.direction * degToRad) * this.acceleration
        this.velocity.z += Math.sin(this.direction * degToRad) * this.acceleration

        // Reset acceleration
        this.acceleration = 0

        // Add gravity to velocity
        if(!this.grounded) this.velocity.y -= this.GRAVITY

        // Clamp -y velocity to the max fall speed
        if (this.velocity.y < -this.MAXFALLSPEED) this.velocity.y = -this.MAXFALLSPEED

        // If player falls out of world move them to spawn
        if (this.node.position.y < -10) this.node.position.set(this.spawn.x, this.spawn.y, this.spawn.z)


        // Make sun and moon face camera
        // let sun = this.sunMoon.getObjectByName("sun")
        // let moon = this.sunMoon.getObjectByName("moon")
        // sun.lookAt(camera.position)
        // moon.lookAt(camera.position)
    }
}