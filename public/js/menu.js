let body = document.body

document.onmousemove = event => {
    let xP = (Math.round(event.pageX / body.clientWidth * 100) / 100 * 2 - 1) * -16
    let yP = (Math.round(event.pageY / body.clientHeight * 100) / 100 * 2 - 1) * -16

    document.documentElement.style.setProperty('--shadow-x', xP + 'px')
    document.documentElement.style.setProperty('--shadow-y', yP + 'px')
}