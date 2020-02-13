import * as THREE from "../packages/three.module.js"

export default class Block {
    constructor(X, Y, Z, type, texture) {
        this.x = X
        this.y = Y
        this.z = Z
        this.type

        this.material = this.generateMaterial(texture)
    }

    generateMesh() {
        let geometry = new THREE.BoxGeometry()
        let cube = new THREE.Mesh(geometry, this.material)

        cube.position.x = this.x
        cube.position.y = this.y
        cube.position.z = this.z

        return cube
    }

    generateMaterial(texture) {
        if (!Array.isArray(texture)) {
            // Single Texture
            texture.magFilter = THREE.NearestFilter
            return new THREE.MeshBasicMaterial({
                map: texture
            })
        } else {
            if (texture.length == 3) {
                // 3 Textures
                let side = texture[0]
                let top = texture[1]
                let bot = texture[2]

                // Remove re-sampling filter
                side.magFilter = THREE.NearestFilter
                top.magFilter = THREE.NearestFilter
                bot.magFilter = THREE.NearestFilter

                return [
                    new THREE.MeshBasicMaterial({
                        map: side
                    }),
                    new THREE.MeshBasicMaterial({
                        map: side
                    }),
                    new THREE.MeshBasicMaterial({
                        map: top
                    }),
                    new THREE.MeshBasicMaterial({
                        map: bot
                    }),
                    new THREE.MeshBasicMaterial({
                        map: side
                    }),
                    new THREE.MeshBasicMaterial({
                        map: side
                    }),
                ]
            } else if (texture.length == 6) {
                // 6 Textures
                let mats = []
                for (let i = 0; i < texture.length; i++) {
                    texture[i].magFilter = THREE.NearestFilter
                    mats.push(
                        new THREE.MeshBasicMaterial({
                            map: texture[i]
                        }))
                }

                return mats

            } else {
                console.error("ERR: Can only instantiate blocks with 1, 3, or 6 textures")
                return
            }
        }
    }
}