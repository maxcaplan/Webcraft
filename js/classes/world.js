import * as THREE from "../packages/three.module.js"
import "../packages/simplex-noise.js"

import * as config from "../config.js"

import RenderManager from "./renderManager.js"

import Chunk from "./chunk.js"
import Player from "./player.js"

export default class World {
    constructor(canvas) {
        this.seed = this.generateSeed()
        this.simplex = new SimplexNoise(this.seed)

        this.RenderManager = new RenderManager(canvas)

        this.worldTime = 0
        this.pause = false

        this.renderDistance = 1

        this.materials = this.loadMaterials()

        this.player = new Player(0, 200, 0)

        this.RenderManager.scene.add(this.player.node)

        // FPS counter
        this.stats = new Stats()
        this.stats.showPanel(0)
        document.body.appendChild(this.stats.dom)

        // TODO: Move chunks into a chunk manager
        this.chunks = []

        let tempWorldSize = 2
        for (let x = 0; x < tempWorldSize; x++) {
            for (let z = 0; z < tempWorldSize; z++) {
                let testChunk = new Chunk(x, z, this.simplex, 0.02, 10)
                testChunk.generateChunkGeometry(this.RenderManager.scene, this.materials)

                this.chunks.push(testChunk)
            }
        }
    }

    // Main game loop
    doTick() {
        this.stats.begin()

        if (!this.pause) {
            this.worldTime += 1

            this.player.update(this.RenderManager.camera, this.chunks)

            this.RenderManager.render(this.worldTime, this.player)
        }

        this.stats.end()
    }

    // Generates alphanumeric world seed
    generateSeed(length) {
        const SEED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456890"
        let seed = ""

        for (let s = 0; s < length; s++) {
            seed += SEED_CHARS[Math.round(Math.random() * SEED_CHARS.length)]
        }

        return seed
    }

    // Loads all materials used in the world
    loadMaterials() {
        let materials = []

        // Load Textures
        let loader = new THREE.TextureLoader()
        loader.setPath("../../resources/textures/blocks/")

        let dirtText = loader.load('dirt.png')
        dirtText.magFilter = THREE.NearestFilter

        let stoneText = loader.load('stone.png')
        stoneText.magFilter = THREE.NearestFilter

        let bedrockText = loader.load('bedrock.png')
        bedrockText.magFilter = THREE.NearestFilter

        let grassTopText = loader.load('grass_block_top_green.png')
        grassTopText.magFilter = THREE.NearestFilter

        let grassSideText = loader.load('grass_block_side.png')
        grassSideText.magFilter = THREE.NearestFilter

        let grassBotText = loader.load('dirt.png')
        grassBotText.magFilter = THREE.NearestFilter


        // Base material for all solid blocks
        let solidMat = new THREE.MeshBasicMaterial()

        // Create specific materials from base
        let dirt = solidMat.clone()
        dirt.map = dirtText

        let stone = solidMat.clone()
        stone.map = stoneText

        let bedrock = solidMat.clone()
        bedrock.map = bedrockText

        let grassTop = solidMat.clone()
        grassTop.map = grassTopText

        let grassSide = solidMat.clone()
        grassSide.map = grassSideText

        let grassBot = solidMat.clone()
        grassBot.map = grassBotText


        // Add material to global array
        materials.push(dirt)
        materials.push(stone)
        materials.push(bedrock)
        materials.push(grassTop)
        materials.push(grassSide)
        materials.push(grassBot)

        solidMat.dispose()

        return materials
    }
}