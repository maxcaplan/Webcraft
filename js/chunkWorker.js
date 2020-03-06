self.importScripts("./packages/three.min.js")

// Helper function that checks how many adjacent blocks are active
function checkNeighbor(x, y, z, blocks) {
    let px = false,
        nx = false,
        py = false,
        ny = false,
        pz = false,
        nz = false

    if (x < blocks[y].length - 1) px = blocks[y][x + 1][z].active
    if (x > 0) nx = blocks[y][x - 1][z].active

    if (y < blocks.length - 1) py = blocks[y + 1][x][z].active
    if (y > 0) ny = blocks[y - 1][x][z].active

    if (z < blocks[y][x].length - 1) pz = blocks[y][x][z + 1].active
    if (z > 0) nz = blocks[y][x][z - 1].active

    return [px, nx, py, ny, pz, nz]
}

// Generates geometry for individual blocks
function generateBlockGeometry(x, y, z, sides, size) {
    let geometries = []

    x -= (size / 2)
    z -= (size / 2)

    if (!sides[0]) {
        var pxGeometry = new THREE.PlaneGeometry(1, 1);
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(x + 0.5, y + 0, z + 0);

        geometries.push({
            geometry: pxGeometry,
            side: 'px',
            index: 0
        })

        pxGeometry.dispose()
    }
    if (!sides[1]) {
        var nxGeometry = new THREE.PlaneGeometry(1, 1);
        nxGeometry.rotateY(-Math.PI / 2);
        nxGeometry.translate(x - 0.5, y + 0, z + 0);

        geometries.push({
            geometry: nxGeometry,
            side: 'nx',
            index: 1
        })

        nxGeometry.dispose()
    }

    if (!sides[2]) {
        var pyGeometry = new THREE.PlaneGeometry(1, 1);
        pyGeometry.rotateX(-Math.PI / 2);
        pyGeometry.translate(x + 0, y + 0.5, z + 0);

        geometries.push({
            geometry: pyGeometry,
            side: 'py',
            index: 2
        })

        pyGeometry.dispose()
    }
    if (!sides[3]) {
        var nyGeometry = new THREE.PlaneGeometry(1, 1);
        nyGeometry.rotateX(Math.PI / 2);
        nyGeometry.translate(x + 0, y - 0.5, z + 0);

        geometries.push({
            geometry: nyGeometry,
            side: 'ny',
            index: 3
        })

        nyGeometry.dispose()
    }

    if (!sides[4]) {
        var pzGeometry = new THREE.PlaneGeometry(1, 1);
        pzGeometry.translate(x + 0, y + 0, z + 0.5);

        geometries.push({
            geometry: pzGeometry,
            side: 'pz',
            index: 4
        })

        pzGeometry.dispose()
    }
    if (!sides[5]) {
        var nzGeometry = new THREE.PlaneGeometry(1, 1);
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(x + 0, y + 0, z - 0.5);

        geometries.push({
            geometry: nzGeometry,
            side: 'nz',
            index: 5
        })

        nzGeometry.dispose()
    }

    return geometries
}

self.onmessage = e => {
    let blocks = e.data.blocks
    let size = e.data.size
    let materialMeta = e.data.meta
    
    let geometry = new THREE.Geometry()
    let matrix = new THREE.Matrix4()

    for (let y = 0; y < blocks.length; y++) {
        for (let x = 0; x < blocks[y].length; x++) {
            for (let z = 0; z < blocks[y][x].length; z++) {
                if (blocks[y][x][z].active) {
                    let type = blocks[y][x][z].type

                    let metaIndex = materialMeta.findIndex(meta => {
                        return meta.type == type
                    })

                    let sides = checkNeighbor(x, y, z, blocks)
                    let blockGeo = generateBlockGeometry(x, y, z, sides, size)

                    blockGeo.forEach(face => {
                        // Calculate material index for face
                        let index = metaIndex
                        let offset = 0
                        if(materialMeta[metaIndex].length > 1) offset = materialMeta[metaIndex].map[face.index]
                        index += offset

                        // Merge face with chunk geometry
                        geometry.merge(face.geometry, matrix, index)
                        face.geometry.dispose()
                    })
                }
            }
        }
    }

    // Convert geometry to JSON buffer geometry object
    let bufferGeometry = new THREE.BufferGeometry()
    bufferGeometry.fromGeometry(geometry)
    let bufferJSON = JSON.stringify(bufferGeometry.toJSON())

    // Send JSON data back to main thread
    self.postMessage(bufferJSON)

    self.close()
}