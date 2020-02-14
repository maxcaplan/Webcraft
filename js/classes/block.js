import * as THREE from "../packages/three.module.js"
import {
    BufferGeometryUtils
} from "../packages/BufferGeometryUtils.js"

export default class Block {
    constructor(X, Y, Z, type, texture) {
        this.x = X
        this.y = Y
        this.z = Z
        this.type = type

        this.textures = texture

        // this.material = this.generateMaterial(texture)
    }

    generateMesh(sides) {
        var matrix = new THREE.Matrix4();

        matrix.setPosition(this.x, this.y, this.z)

        var pxGeometry = new THREE.PlaneGeometry(1, 1);
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(0.5, 0, 0);

        var nxGeometry = new THREE.PlaneGeometry(1, 1);
        nxGeometry.rotateY(-Math.PI / 2);
        nxGeometry.translate(-0.5, 0, 0);

        var pyGeometry = new THREE.PlaneGeometry(1, 1);
        pyGeometry.rotateX(-Math.PI / 2);
        pyGeometry.translate(0, 0.5, 0);

        var nyGeometry = new THREE.PlaneGeometry(1, 1);
        nyGeometry.rotateX(Math.PI / 2);
        nyGeometry.translate(0, -0.5, 0);

        var pzGeometry = new THREE.PlaneGeometry(1, 1);
        pzGeometry.translate(0, 0, 0.5);

        var nzGeometry = new THREE.PlaneGeometry(1, 1);
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(0, 0, -0.5);

        var geometry = new THREE.Geometry();

        if(sides[0]) geometry.merge(pxGeometry, matrix, 0)
        if(sides[1]) geometry.merge(nxGeometry, matrix, 1)

        if(sides[2]) geometry.merge(pyGeometry, matrix, 2)
        if(sides[3]) geometry.merge(nyGeometry, matrix, 3)

        if(sides[4]) geometry.merge(pzGeometry, matrix, 4)
        if(sides[5]) geometry.merge(nzGeometry, matrix, 5)

        // geometry = new THREE.BufferGeometry().fromGeometry(geometry);

        // var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        // var cube = new THREE.Mesh(geometry, this.material);

        // cube.position.x = this.x
        // cube.position.y = this.y
        // cube.position.z = this.z

        return geometry
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