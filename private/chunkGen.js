const THREE = require('three');
const SimplexNoise = require('simplex-noise')

// ------- //
// Classes //
// ------- //

// World chunk class
class Chunk {
    constructor(X, Z, chunkDepth, simplex, genHeight, genSize, generate = true) {
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
        this.geometry

        if (generate) {
            this.generateBlocks()
        }
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

        // let loader = new THREE.TextureLoader();
        // loader.setPath("../public/resources/textures/blocks/")

        this.blocks.forEach(data => {
            if (!types.includes(data.block.type)) {
                types.push(data.block.type)
                if (data.block.type == 1) {
                    // let dirt = loader.load('dirt.png')
                    // dirt.magFilter = THREE.NearestFilter

                    let mat = new THREE.MeshBasicMaterial({
                        // map: dirt,
                        color: 0x564946,
                        side: THREE.DoubleSide
                    })

                    order.push({
                        type: data.block.type,
                        start: mats.length
                    })
                    mats.push(mat, mat, mat, mat, mat, mat)

                }
                if (data.block.type == 2) {
                    // let side = loader.load('grass_block_side.png')
                    // let top = loader.load('grass_block_top_green.png')
                    // let bot = loader.load('dirt.png')
                    // side.magFilter = THREE.NearestFilter
                    // top.magFilter = THREE.NearestFilter
                    // bot.magFilter = THREE.NearestFilter

                    let xz = new THREE.MeshBasicMaterial({
                        // map: side,
                        color: 0x564946,
                        side: THREE.DoubleSide
                    })
                    let py = new THREE.MeshBasicMaterial({
                        // map: top,
                        color: 0x18F2B2,
                        side: THREE.DoubleSide
                    })
                    let ny = new THREE.MeshBasicMaterial({
                        // map: bot,
                        color: 0x564946,
                        side: THREE.DoubleSide
                    })

                    order.push({
                        type: data.block.type,
                        start: mats.length
                    })
                    mats.push(xz, xz, py, ny, xz, xz)
                }
            }
        })

        this.materials = mats
        this.materialsOrder = order
    }

    // Generates chunks geometry based on blocks
    generateGeometry() {
        let matrix = new THREE.Matrix4()
        let geometries = []

        this.generateMaterial()

        this.blocks.forEach(data => {
            let sides = this.checkFaces(data.block.x, data.block.y, data.block.z)

            geometries.push(data.block.generateGeometry(sides))
        })

        let geometry = new THREE.Geometry()

        geometries.forEach(data => {
            let matOffset = this.materialsOrder.find(k => k.type == data.type).start

            data.geometry.forEach(face => {
                geometry.merge(face.plane, matrix, matOffset + (face.side - 1))
            })
        })

        geometry = new THREE.BufferGeometry().fromGeometry(geometry)

        // let mesh = new THREE.Mesh(geometry, this.materials);

        this.geometry = geometry
    }

    // Checks whether block has hidden faces
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

    // Compiles chunk data into JSON object
    compileJSON() {
        let Data = {}

        // Add instantiation values
        Data.globalX = this.globalX
        Data.globalZ = this.globalZ
        Data.chunkDepth = this.chunkDepth
        Data.genHeight = this.genHeight
        Data.genSize = this.genSize
        Data.size = this.size

        // Convert chunk materials to JSON
        let matJSON = []
        this.materials.forEach(mat => {
            matJSON.push(mat.toJSON())
        })

        Data.materials = matJSON
        Data.materialsOrder = this.materialsOrder

        // Convert chunk geometry to JSON
        Data.geometry = this.geometry.toJSON()

        // Convert Blocks to JSON
        let blockJSON = []
        this.blocks.forEach(obj => {
            blockJSON.push(obj.block.compileJSON())
        })

        Data.blocks = blockJSON

        return Data
    }
}

// Individual block class
class Block {
    constructor(X, Y, Z, type) {
        this.x = X
        this.y = Y
        this.z = Z
        this.type = type
    }

    generateGeometry(sides) {
        var matrix = new THREE.Matrix4();

        var pxGeometry = new THREE.PlaneGeometry(1, 1);
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(this.x + 0.5, this.y + 0, this.z + 0);

        var nxGeometry = new THREE.PlaneGeometry(1, 1);
        nxGeometry.rotateY(-Math.PI / 2);
        nxGeometry.translate(this.x - 0.5, this.y + 0, this.z + 0);

        var pyGeometry = new THREE.PlaneGeometry(1, 1);
        pyGeometry.rotateX(-Math.PI / 2);
        pyGeometry.translate(this.x + 0, this.y + 0.5, this.z + 0);

        var nyGeometry = new THREE.PlaneGeometry(1, 1);
        nyGeometry.rotateX(Math.PI / 2);
        nyGeometry.translate(this.x + 0, this.y - 0.5, this.z + 0);

        var pzGeometry = new THREE.PlaneGeometry(1, 1);
        pzGeometry.translate(this.x + 0, this.y + 0, this.z + 0.5);

        var nzGeometry = new THREE.PlaneGeometry(1, 1);
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(this.x + 0, this.y + 0, this.z - 0.5);

        let geometries = []

        if (sides[0]) geometries.push({
            plane: pxGeometry,
            side: 1
        })
        if (sides[1]) geometries.push({
            plane: nxGeometry,
            side: 2
        })

        if (sides[2]) geometries.push({
            plane: pyGeometry,
            side: 3
        })
        if (sides[3]) geometries.push({
            plane: nyGeometry,
            side: 4
        })

        if (sides[4]) geometries.push({
            plane: pzGeometry,
            side: 5
        })
        if (sides[5]) geometries.push({
            plane: nzGeometry,
            side: 6
        })

        return {
            geometry: geometries,
            type: this.type
        }
    }

    // Compiles block data into JSON object
    compileJSON() {
        let Data = {}

        Data.x = this.x
        Data.y = this.y
        Data.z = this.z
        Data.type = this.type

        return Data
    }
}

// ------------------ //
// Process Management //
// ------------------ //

process.on('message', message => {
    let init = JSON.parse(message)

    var simplex = new SimplexNoise(init.seed)
    let ChunkObj = new Chunk(init.x, init.z, init.chunkDepth, simplex, init.chunkHeight, init.chunkSize)

    console.log("generating geometry and materials ...")
    ChunkObj.generateGeometry()

    console.log("compiling JSON ...")
    let Data = ChunkObj.compileJSON()

    process.send(JSON.stringify(Data))
})



// function test() {
//     console.log("Hello World process")
//     return "Hello World return"
// }

// process.on('message', message => {
//     console.log(JSON.parse(message).id)
//     console.log(JSON.parse(message).test)
//     const result = test()
//     process.send(result);
// });