import * as THREE from "../packages/three.module.js"
import {
    BufferGeometryUtils
} from "../packages/BufferGeometryUtils.js"

export default class Block {
    constructor(X, Y, Z, type) {
        this.x = X
        this.y = Y
        this.z = Z
        this.type = type

        // this.textures = texture

        // this.material = this.generateMaterial(texture)
    }

    generateMesh(sides) {
        var matrix = new THREE.Matrix4();

        // matrix.setPosition(this.x, this.y, this.z)

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

        // geometry = new THREE.BufferGeometry().fromGeometry(geometry);

        // var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        // var cube = new THREE.Mesh(geometry, this.material);

        // cube.position.x = this.x
        // cube.position.y = this.y
        // cube.position.z = this.z

        return {
            geometry: geometries,
            type: this.type
        }
    }

    generateMaterial(texture) {
        if (!Array.isArray(texture)) {
            // Single Texture
            texture.magFilter = THREE.NearestFilter
            return new THREE.MeshStandardMaterial({
                map: texture,
                side: THREE.DoubleSide
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
                    new THREE.MeshStandardMaterial({
                        map: side,
                        side: THREE.DoubleSide
                    }),
                    new THREE.MeshStandardMaterial({
                        map: side,
                        side: THREE.DoubleSide
                    }),
                    new THREE.MeshStandardMaterial({
                        map: top,
                        side: THREE.DoubleSide
                    }),
                    new THREE.MeshStandardMaterial({
                        map: bot,
                        side: THREE.DoubleSide
                    }),
                    new THREE.MeshStandardMaterial({
                        map: side,
                        side: THREE.DoubleSide
                    }),
                    new THREE.MeshStandardMaterial({
                        map: side,
                        side: THREE.DoubleSide
                    }),
                ]
            } else if (texture.length == 6) {
                // 6 Textures
                let mats = []
                for (let i = 0; i < texture.length; i++) {
                    texture[i].magFilter = THREE.NearestFilter
                    mats.push(
                        new THREE.MeshStandardMaterial({
                            map: texture[i],
                            side: THREE.DoubleSide
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