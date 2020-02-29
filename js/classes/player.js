import * as THREE from "../packages/three.module.js"

export default class player {
    constructor(x = 0, y = 0, z = 0) {
        this.object = new THREE.Object3D()

        this.object.position.x = x
        this.object.position.y = y
        this.object.position.z = z

        this.model
        this.material
        this.mesh

        this.camera
        this.light

        this.sun

        this.constructPlayer()
    }

    constructPlayer() {
        this.modal = new THREE.BoxBufferGeometry()
        this.material = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF
        })

        this.mesh = new THREE.Mesh(this.modal, this.material)

        this.light = new THREE.PointLight(0xffffff, 0.5, 10);

        this.object.add(this.mesh)
        this.object.add(this.light)
    }
}