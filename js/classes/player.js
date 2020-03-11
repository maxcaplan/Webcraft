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
        this.GRAVITY = config.playerConf.GRAVITY
        this.MAXFALLSPEED = config.playerConf.MAXFALLSPEED
        this.JUMPSPEED = config.playerConf.JUMPSPEED
        this.MOVESPEED = config.playerConf.MOVESPEED
        this.MAXMOVESPEED = config.playerConf.MAXMOVESPEED

        this.velocity = {
            x: 0,
            y: 0,
            z: 0
        }
        this.acceleration = 0
        this.direction = 0

        this.grounded = false

        // Array to keep track of input keys
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false
        }

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

        // Attach capture functions to key events
        let that = this;
        window.onkeydown = function (e) {
            that.captureKeyDown(e)
        }

        window.onkeyup = function (e) {
            that.captureKeyUp(e)
        }

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

    // Updates key state on keydown event
    captureKeyDown(event) {
        let key = event.key
        if (key == " ") key = "space"
        // Check if key is used for input
        if (this.keys[key] != undefined) {
            // Update key state
            this.keys[key] = true
        }
    }
    // Updates key state on keyUp event
    captureKeyUp(event) {
        let key = event.key
        if (key == " ") key = "space"
        // Check if key is used for input
        if (this.keys[key] != undefined) {
            // Update key state
            this.keys[key] = false
        }
    }

    // Applies movement input to player physics
    move() {
        // Jump
        if (this.keys.space) {
            if (this.grounded) this.velocity.y = this.JUMPSPEED
        }

        // Move forward
        if (this.keys.w) {
            this.node.position.z += this.MOVESPEED
        }
        // Move backwards
        if (this.keys.s) {
            this.node.position.z -= this.MOVESPEED
        }

        // Move left
        if (this.keys.a) {
            this.node.position.x += this.MOVESPEED
        }
        // Move right
        if (this.keys.d) {
            this.node.position.x -= this.MOVESPEED
        }
    }

    // Checks if player is colliding with an active block
    checkCollisions(chunks) {
        let collisions = {
            px: false,
            nx: false,
            py: false,
            ny: false,
            pz: false,
            nz: false
        }

        let playerPos = {
            x: this.node.position.x,
            y: this.node.position.y,
            z: this.node.position.z
        }

        this.rayCaster.set(new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z), new THREE.Vector3(0, -1, 0))

        // Check which chunks to check collisions for
        let colChunks = []
        let chunkLocalPos = {
            x: Math.round(playerPos.x / config.chunkConf.size),
            z: Math.round(playerPos.z / config.chunkConf.size)
        }

        // Get chunk the player is in
        let currentChunk = chunks.find(chunk => {
            return chunk.chunkX == chunkLocalPos.x && chunk.chunkZ == chunkLocalPos.z
        })

        if(currentChunk != undefined) colChunks.push(currentChunk)

        // Get adjacent chunks
        if (colChunks.length > 0) {
            // If player is to the left of the current chunk
            if (colChunks[0].chunkX - playerPos.x < 0) {
                let adjChunk = chunks.find(chunk => {
                    return chunk.chunkX == chunkLocalPos.x + 1 && chunk.chunkZ == chunkLocalPos.z
                })
                if(adjChunk != undefined) colChunks.push(adjChunk)
            }
            // If player is to the right of the current chunk
            if (colChunks[0].chunkX - playerPos.x > 0) {
                let adjChunk = chunks.find(chunk => {
                    return chunk.chunkX == chunkLocalPos.x - 1 && chunk.chunkZ == chunkLocalPos.z
                })
                if(adjChunk != undefined) colChunks.push(adjChunk)
            }
            // If player is to the back of the current chunk
            if (colChunks[0].chunkZ - playerPos.z < 0) {
                let adjChunk = chunks.find(chunk => {
                    return chunk.chunkX == chunkLocalPos.x && chunk.chunkZ == chunkLocalPos.z + 1
                })
                if(adjChunk != undefined) colChunks.push(adjChunk)
            }
            // If player is to the right of the current chunk
            if (colChunks[0].chunkZ - playerPos.z > 0) {
                let adjChunk = chunks.find(chunk => {
                    return chunk.chunkX == chunkLocalPos.x && chunk.chunkZ == chunkLocalPos.z - 1
                })
                if(adjChunk != undefined) colChunks.push(adjChunk)
            }
        }

        // If there is no chunks to collide with, don't check collisions
        if(colChunks.length <= 0) {
            this.grounded = false
            return
        }

        // Only check chunks that have a generated mesh
        let colMeshes = colChunks.filter(chunk => {
            return chunk.mesh != undefined
        })

        // 
        colMeshes = colMeshes.map(chunk => {
            return chunk.mesh
        })

        // console.log(colMeshes)

        // Cast a ray downwards to see if player has collided with the ground
        let castColls = []
        if (colMeshes.length > 0) castColls = this.rayCaster.intersectObjects(colMeshes)

        if (castColls.length > 0) {
            // If collided with ground remove y velocity
            if (castColls[0].distance <= config.playerConf.height / 2) {
                if (!this.grounded && this.velocity != 0) {
                    this.grounded = true
                    this.velocity.y = 0
                    this.node.position.y = castColls[0].point.y + (config.playerConf.height / 2)
                }
            } else {
                this.grounded = false
            }
        } else {
            this.grounded = false
        }
    }

    // Updates player physics each frame
    update(camera, chunks, checkColls = true) {
        // Get player input
        this.move()

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
        if (!this.grounded) this.velocity.y -= this.GRAVITY

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