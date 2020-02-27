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

        this.materials = []
        this.materialsOrder = []

        this.blocks = []
        this.generateBlocks()
    }

    // Generates array of block objects
    generateBlocks() {
        for (let z = 0; z < this.size; z++) {
            for (let x = 0; x < this.size; x++) {
                let X = x + (this.globalX * this.size) - this.size / 2 + 0.5
                let Z = z + (this.globalZ * this.size) - this.size / 2 + 0.5

                let height = Math.round(((this.simplex.noise2D(X * this.genSize, Z * this.genSize) + 2) / 2) * this.genHeight)
                for (let y = 0; y < this.chunkDepth + height; y++) {
                    let Y = height - y - this.genHeight - this.chunkDepth
                    if (y == 0) {
                        this.blocks.push({
                            block: new Block(X, Y, Z, 2),
                            x: X,
                            y: Y,
                            z: Z
                        })
                    } else {
                        this.blocks.push({
                            block: new Block(X, Y, Z, 1),
                            x: X,
                            y: Y,
                            z: Z
                        })
                    }
                }
            }
        }
    }

    // Generates global material for chunk
    generateMaterial() {
        let mats = []
        let types = []
        let order = []

        let loader = new THREE.TextureLoader();
        loader.setPath("../resources/textures/blocks/")

        this.blocks.forEach(data => {
            if (!types.includes(data.block.type)) {
                types.push(data.block.type)
                if (data.block.type == 1) {
                    let dirt = loader.load('dirt.png')
                    dirt.magFilter = THREE.NearestFilter

                    let mat = new THREE.MeshPhongMaterial({
                        map: dirt,
                        side: THREE.DoubleSide
                    })

                    order.push({
                        type: data.block.type,
                        start: mats.length,
                        length: 1
                    })
                    mats.push(mat)

                }
                if (data.block.type == 2) {
                    let side = loader.load('grass_block_side.png')
                    let top = loader.load('grass_block_top_green.png')
                    let bot = loader.load('dirt.png')
                    side.magFilter = THREE.NearestFilter
                    top.magFilter = THREE.NearestFilter
                    bot.magFilter = THREE.NearestFilter

                    let sideMat = new THREE.MeshPhongMaterial({
                        map: side,
                        side: THREE.DoubleSide
                    })
                    let topMat = new THREE.MeshPhongMaterial({
                        map: top,
                        side: THREE.DoubleSide
                    })
                    let botMat = new THREE.MeshPhongMaterial({
                        map: bot,
                        side: THREE.DoubleSide
                    })

                    order.push({
                        type: data.block.type,
                        start: mats.length,
                        length: 3
                    })
                    mats.push(sideMat, topMat, botMat)
                }
            }
        })

        this.materials = mats
        this.materialsOrder = order
    }

    // Generates chunks mesh based on blocks
    generateMesh() {
        let matrix = new THREE.Matrix4()
        let geometries = []

        this.generateMaterial()

        this.blocks.forEach(data => {
            let sides = this.checkFaces(data.block.x, data.block.y, data.block.z)

            geometries.push(data.block.generateMesh(sides))
        })

        let geometry = new THREE.Geometry()

        // Merge geometries
        geometries.forEach(data => {
            // Calculate material index for face
            let matMeta = this.materialsOrder.find(k => k.type == data.type)
            let start = matMeta.start
            let len = matMeta.length

            if (len == 1) {
                data.geometry.forEach(face => {
                    geometry.merge(face.plane, matrix, start)
                })
            } else if (len == 3) {
                data.geometry.forEach(face => {
                    if (face.side == 'py') {
                        geometry.merge(face.plane, matrix, start + 1)
                    } else if (face.side == 'ny') {
                        geometry.merge(face.plane, matrix, start + 2)
                    } else {
                        geometry.merge(face.plane, matrix, start)
                    }
                })
            } else {
                data.geometry.forEach(face => {
                    geometry.merge(face.plane, matrix, start + (face.index - 1))
                })
            }
        })

        geometry = new THREE.BufferGeometry().fromGeometry(geometry)

        let mesh = new THREE.Mesh(geometry, this.materials);

        return mesh
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
}