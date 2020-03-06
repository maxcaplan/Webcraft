console.log("Welcome to Craft.js")

// Import classes
import World from "./classes/world.js"

let viewport = document.querySelector("#viewport")
let pauseMenu = document.querySelector(".pause")
let unpauseBtn = document.querySelector("#unpause")

// Pause handling
let down = false
window.onkeydown = e => {
    if (down) return

    if (e.keyCode == 27) {
        world.pause = !world.pause
    }

    if (world.pause) {
        pauseMenu.style.display = "block"
        viewport.style.webkitFilter = "blur(8px)";
        viewport.style.filter - "blur(8px)"
    } else {
        pauseMenu.style.display = "none"
        viewport.style.webkitFilter = "blur(0px)";
        viewport.style.filter - "blur(0px)"
    }

    down = true
}

window.onkeyup = e => {
    if (e.keyCode == 27) {
        down = false
    }
}

unpauseBtn.onclick = e => {
    world.pause = false

    pauseMenu.style.display = "none"
    viewport.style.webkitFilter = "blur(0px)";
    viewport.style.filter - "blur(0px)"
}

// Setup game world
let world = new World(viewport)

// account for window resizing
window.addEventListener('resize', e => {
    world.RenderManager.windowResize()
}, false);

function main() {
    world.doTick()
    requestAnimationFrame(main)
}

main()