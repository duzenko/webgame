const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement
const context = canvas.getContext("2d") as CanvasRenderingContext2D

console.log("addEventListener")
window.setTimeout(present, 1)

function present() {
    checkSize()
    drawAll()
}

function checkSize() {
    const width = window.devicePixelRatio * canvas.clientWidth
    const height = window.devicePixelRatio * canvas.clientHeight
    if (canvas.width != width || canvas.height != height) {
        console.log("Resize canvas from", canvas.width, 'x', canvas.height, "to", width, 'x', height)
        canvas.width = width;
        canvas.height = height;
    }
}

function drawAll() {
    context.fillStyle = "brown"
    context.fillRect(0, 0, canvas.width, canvas.height)
    const start = [-8, 0];
    const end = [2, 2];
    context.fillStyle = "black"
    drawHexagon(start[0], start[1], true)
    context.fillStyle = "red"
    drawHexagon(end[0], end[1], true)
    context.fillStyle = "green"
    const path = pathFromTo(start, end)
    for (const location of path) {
        drawHexagon(location[0], location[1], true);
    }
    const columns = [-9, 9]
    const rows = [-3, 3]
    context.strokeStyle = "white";
    for (let y = rows[0]; y <= rows[1]; y++) {
        for (let x = columns[0]; x <= columns[1]; x++) {
            if ((x & 1) != (y & 1))
                continue;
            drawHexagon(x, y, false)
        }
    }
}

function drawHexagon(x: number, y: number, fill: boolean) {
    const angle = 2 * Math.PI / 6
    const radius = 48
    const step = radius * Math.sin(Math.PI / 3)
    const screenX = x * step + canvas.width / 2
    const screenY = y * radius * 1.5 + canvas.height / 2
    context.beginPath()
    for (let i = 0; i < 6; i++) {
        const xx = screenX + radius * Math.sin(angle * i)
        const yy = screenY + radius * Math.cos(angle * i)
        context.lineTo(xx, yy)
    }
    context.closePath()
    if (fill) {
        context.fill()
    } else {
        context.stroke()
    }
}

function pathFromTo(start: number[], end: number[]): number[][] {
    const path = new Array
    var x = start[0]
    var y = start[1]
    while (path.length < 33) {
        if (Math.abs(end[0] - x) > Math.abs(end[1] - y)) {
            x += Math.sign(end[0] - x) * 2
        } else {
            y += Math.sign(end[1] - y)
            x += Math.sign(end[0] - x)
        }
        if (x == end[0] && y == end[1]) break
        path.push([x, y])
    }
    return path
}

