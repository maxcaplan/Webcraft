import * as THREE from "../packages/three.module.js"

import * as config from "../config.js"
import Block from "./block.js"

export default class Chunk {
    constructor(X, Z, noise, noiseScale, noiseAmplitude) {
        this.chunkX = X
        this.chunkZ = Z

        this.noise = noise
        this.scale = noiseScale
        this.noiseAmplitude = noiseAmplitude

        this.size = config.chunkConf.size
        this.height = config.chunkConf.height
        this.seaLevel = config.chunkConf.seaLevel

        // blocks are stored in the order [y][x][z]
        this.blocks = this.generateBlocks()

        this.worker
    }

    // Creates 3D array of blocks
    generateBlocks() {
        let blocks = []

        for (let y = 0; y < this.height; y++) {
            let layer = []

            for (let x = 0; x < this.size; x++) {
                let row = []

                for (let z = 0; z < this.size; z++) {
                    let globalX = this.chunkX * this.size + x
                    let globalZ = this.chunkZ * this.size + z

                    // Calculate height map
                    let height = this.noise.noise2D(globalX * this.scale, globalZ * this.scale) * this.noiseAmplitude + this.seaLevel
                    let active = y <= height

                    // Calculate caves
                    if (y <= this.seaLevel && active) {
                        let caveVal = this.noise.noise3D(globalX * this.scale * 2, y * this.scale * 2, globalZ * this.scale * 2)

                        active = caveVal < 0.5
                    }

                    // Calculate type of block to be added to the array
                    if (active) {
                        if (y < 1 + Math.round(Math.random() * 2)) {
                            row.push(new Block(active, config.blockTypes.BEDROCK))
                        } else if (y > height - 1) {
                            row.push(new Block(active, config.blockTypes.GRASS))
                        } else if (y <= height - 5 + Math.round(Math.random())) {
                            row.push(new Block(active, config.blockTypes.STONE))
                        } else {
                            row.push(new Block(active, config.blockTypes.DIRT))
                        }

                    } else {
                        row.push(new Block(active, config.blockTypes.AIR))
                    }
                }

                layer.push(row)
            }

            blocks.push(layer)
        }

        return blocks
    }

    // Generates the geometry for the mesh to be rendered
    // TODO move this back into a web worker
    generateChunkGeometry(scene, materials) {
        // Instantiate new worker to generate chunk geometry in worker thread
        this.worker = new Worker('./js/chunkWorker.js')
        this.worker.postMessage({
            blocks: this.blocks,
            size: this.size,
            meta: config.materialMeta
        })

        // Process geometry data when received from worker
        this.worker.onmessage = e => {
            var loader = new THREE.BufferGeometryLoader();

            // Parse geometry JSON to BufferGeometry object
            let geoJSON = JSON.parse(e.data)
            let geometry = loader.parse(geoJSON)

            // Create and position chunk mesh
            let mesh = new THREE.Mesh(geometry, materials)
            mesh.position.set(this.chunkX * this.size, 0, this.chunkZ * this.size)

            // add mesh to scene
            scene.add(mesh)
        }
    }

    // Generates geometry for individual blocks
    generateBlockGeometry(x, y, z, sides) {
        let geometries = []

        x -= (this.size / 2)
        z -= (this.size / 2)

        if (!sides[0]) {
            var pxGeometry = new THREE.PlaneGeometry(1, 1);
            pxGeometry.rotateY(Math.PI / 2);
            pxGeometry.translate(x + 0.5, y, z);

            geometries.push({
                geometry: pxGeometry,
                side: 'px',
                index: 1
            })

            pxGeometry.dispose()
        }
        if (!sides[1]) {
            var nxGeometry = new THREE.PlaneGeometry(1, 1);
            nxGeometry.rotateY(-Math.PI / 2);
            nxGeometry.translate(x - 0.5, y, z);

            geometries.push({
                geometry: nxGeometry,
                side: 'nx',
                index: 2
            })

            nxGeometry.dispose()
        }

        if (!sides[2]) {
            var pyGeometry = new THREE.PlaneGeometry(1, 1);
            pyGeometry.rotateX(-Math.PI / 2);
            pyGeometry.translate(x, y + 0.5, z);

            geometries.push({
                geometry: pyGeometry,
                side: 'py',
                index: 3
            })

            pyGeometry.dispose()
        }
        if (!sides[3]) {
            var nyGeometry = new THREE.PlaneGeometry(1, 1);
            nyGeometry.rotateX(Math.PI / 2);
            nyGeometry.translate(x, y - 0.5, z);

            geometries.push({
                geometry: nyGeometry,
                side: 'ny',
                index: 4
            })

            nyGeometry.dispose()
        }

        if (!sides[4]) {
            var pzGeometry = new THREE.PlaneGeometry(1, 1);
            pzGeometry.translate(x, y, z + 0.5);

            geometries.push({
                geometry: pzGeometry,
                side: 'pz',
                index: 5
            })

            pzGeometry.dispose()
        }
        if (!sides[5]) {
            var nzGeometry = new THREE.PlaneGeometry(1, 1);
            nzGeometry.rotateY(Math.PI);
            nzGeometry.translate(x, y, z - 0.5);

            geometries.push({
                geometry: nzGeometry,
                side: 'nz',
                index: 6
            })

            nzGeometry.dispose()
        }

        return geometries
    }

    // Helper function that checks how many adjacent blocks are active
    checkNeighbor(x, y, z) {
        let px = false,
            nx = false,
            py = false,
            ny = false,
            pz = false,
            nz = false

        if (x < this.blocks[y].length - 1) px = this.blocks[y][x + 1][z].active
        if (x > 0) nx = this.blocks[y][x - 1][z].active

        if (y < this.blocks.length - 1) py = this.blocks[y + 1][x][z].active
        if (y > 0) ny = this.blocks[y - 1][x][z].active

        if (z < this.blocks[y][x].length - 1) pz = this.blocks[y][x][z + 1].active
        if (z > 0) nz = this.blocks[y][x][z - 1].active

        return [px, nx, py, ny, pz, nz]
    }
}