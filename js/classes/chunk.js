import * as THREE from "../packages/three.module.js"
import Block from "./block.js"

export default class Chunk {
    constructor(X, Z, chunkDepth, simplex, genHeight, genSize) {
        // Instantiation Values
        this.globalX = X
        this.globalZ = Z
        this.chunkDepth = chunkDepth
        this.simplex = simplex
        this.genHeight = genHeight
        this.genSize = genSize

        this.size = 16

        // Array that will store all blocks data
        this.blocks = []

        this.generateBlocks()
    }

    generateBlocks() {
        // Texture loader
        let loader = new THREE.TextureLoader();
        loader.setPath("../resources/textures/blocks/")

        // Load side, top, and bottom texture
        let sideTex = loader.load('grass_block_side.png')
        let topTex = loader.load('grass_block_top_green.png')
        let botTex = loader.load('dirt.png')

        for (let z = 0; z < this.size; z++) {
            for (let x = 0; x < this.size; x++) {
                let X = x + (this.globalX * this.size) - this.size / 2
                let Z = z + (this.globalZ * this.size) - this.size / 2

                let height = Math.round((this.simplex.noise2D(X * this.genSize, Z * this.genSize)) * this.genHeight)
                for (let y = 0; y < 3; y++) {
                    let Y = height - y
                    if (y == 0) {
                        this.blocks.push({
                            block: new Block(X, Y, Z, 2, [sideTex, topTex, botTex]),
                            x: X,
                            y: Y,
                            z: Z
                        })
                    } else {
                        this.blocks.push({
                            block: new Block(X, Y, Z, 1, botTex),
                            x: X,
                            y: Y,
                            z: Z
                        })
                    }
                }
            }
        }
    }

    // Checks wether block has hidden faces
    checkFaces(x, y, z) {
        let px = this.blocks.find(data => {
            return data.x == x + 1 && data.y == y && data.z == z
        })
        let nx = this.blocks.find(data => {
            return data.x == x - 1 && data.y == y && data.z == z
        })

        let py = this.blocks.find(data => {
            return data.x == x && data.y == y + 1 && data.z == z
        })
        let ny = this.blocks.find(data => {
            return data.x == x && data.y == y - 1 && data.z == z
        })

        let pz = this.blocks.find(data => {
            return data.x == x && data.y == y && data.z == z + 1
        })
        let nz = this.blocks.find(data => {
            return data.x == x && data.y == y && data.z == z - 1
        })

        let values = [typeof (px) == 'undefined', typeof (nx) == 'undefined', typeof (py) == 'undefined', typeof (ny) == 'undefined', typeof (pz) == 'undefined', typeof (nz) == 'undefined']
        return values
    }

    // generates all meshes for chunk
    generateMesh() {
        let meshes = []

        this.blocks.forEach(data => {
            let sides = this.checkFaces(data.block.x, data.block.y, data.block.z)
            let mesh = data.block.generateMesh(sides)
            meshes.push(mesh)
        })

        return meshes
    }
}