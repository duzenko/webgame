import { canvas, checkSize, context, drawHexagon, screenToCell } from "./canvas"
import { GridCell, Point } from "./classes"
import { objects } from "./objects";

export let debugLines: { color: string, p1: Point, p2: Point }[] = [];

canvas.addEventListener('mousemove', onMouseMove, false)
window.addEventListener('resize', present, false)
window.setTimeout(present, 1)

function present() {
    checkSize()
    drawAll()
}

function drawAll() {
    context.fillStyle = "green"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = "black"
    drawHexagon(objects.start, true)
    if (objects.endCell) {
        context.fillStyle = "red"
        drawHexagon(objects.endCell, true)
        context.fillStyle = "brown"
        const path = objects.start.pathTo(objects.endCell)
        for (const location of path) {
            drawHexagon(location, true);
        }
    }
    context.strokeStyle = "white";
    for (const y of objects.rows) {
        for (const x of objects.columns) {
            const cell = new GridCell(x, y)
            if (cell.isValid()) {
                drawHexagon(cell, false)
            }
        }
    }
    for (let debugLine of debugLines) {
        context.beginPath()
        context.moveTo(debugLine.p1.x, debugLine.p1.y)
        context.lineTo(debugLine.p2.x, debugLine.p2.y)
        context.closePath()
        context.stroke()
    }
    debugLines = []
}

function onMouseMove(ev: MouseEvent) {
    const cell = screenToCell(new Point(ev.offsetX, ev.offsetY))
    if (cell && cell.isInRange(objects.columns, objects.rows)) {
        objects.endCell = cell
    } else {
        objects.endCell = undefined
    }
    present()
}