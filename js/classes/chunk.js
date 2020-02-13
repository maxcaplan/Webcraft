import * as THREE from "../packages/three.module.js"
import Block from "./block.js"

export default class Chunk {
    constructor(X, Z, simplex, genHeight, genSize) {
        // Instantiation Values
        this.globalX = X
        this.globalZ = Z
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

                let Y = Math.round((this.simplex.noise2D(X * this.genSize, Z * this.genSize)) * this.genHeight)

                this.blocks.push(new Block(X, Y, Z, 1, [sideTex, topTex, botTex]))
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