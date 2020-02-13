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
                        this.blocks.push(new Block(X, Y, Z, 1, [sideTex, topTex, botTex]))
                    } else {
                        this.blocks.push(new Block(X, Y, Z, 1, botTex))
                    }
                }
            }
        }
    }

    generateMesh() {
        let meshes = []

        this.blocks.forEach(block => {
            meshes.push(block.generateMesh())
        })

        return meshes
    }
}