import * as THREE from "../packages/three.module.js"

export default class player {
    constructor(x = 0, y = 0, z = 0) {
        this.node = new THREE.Object3D()

        this.node.position.x = x
        this.node.position.y = y
        this.node.position.z = z

        this.mesh

        this.camera
        this.light

        this.sunMoon

        this.constructPlayer()
    }

    constructPlayer() {
        // Create player model mesh
        let geometry = new THREE.BoxBufferGeometry(1, 1.8, 1)
        let material = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF
        })
        this.mesh = new THREE.Mesh(geometry, material)

        // Create player light
        this.light = new THREE.PointLight(0xffffff, 0.5, 10);

        // Create sun and moon axis
        this.sunMoon = new THREE.Object3D()

        // Create sun
        let sunGeo = new THREE.PlaneBufferGeometry(20, 20, 20)
        let sunMat = new THREE.MeshBasicMaterial({
            color: 0xffe854,
            fog: false
        })
        let sunMesh = new THREE.Mesh(sunGeo, sunMat)
        sunMesh.name = "sun"
        sunMesh.position.z = -200

        // Create moon
        let moonGeo = new THREE.PlaneBufferGeometry(20, 20, 20)
        let moonMat = new THREE.MeshBasicMaterial({
            color: 0xf7fcff,
            fog: false
        })
        let moonMesh = new THREE.Mesh(moonGeo, moonMat)
        moonMesh.name = "moon"
        moonMesh.position.z = 200
        moonMesh.rotation.x = Math.PI

        // Add sun and moon to axis
        this.sunMoon.add(sunMesh)
        this.sunMoon.add(moonMesh)

        // Add objects to player object
        this.node.add(this.mesh)
        this.node.add(this.light)
        this.node.add(this.sunMoon)
    }

    update(camera) {
        // Make sun and moon face camera
        let sun = this.sunMoon.getObjectByName("sun")
        let moon = this.sunMoon.getObjectByName("moon")
        sun.lookAt(camera.position)
        moon.lookAt(camera.position)
    }
}