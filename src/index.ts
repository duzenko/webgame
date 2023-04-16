import { canvas, checkSize, context, drawHexagon, drawUnit, screenToCell } from "./canvas"
import { GridCell, Point } from "./classes"
import { arena } from "./objects";

export let debugLines: { color: string, p1: Point, p2: Point }[] = [];

canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mousedown', onMouseDown, false)
// window.addEventListener('resize', present, false)
window.setInterval(present, 8)

function present() {
    checkSize()
    drawAll()
}

function drawAll() {
    context.fillStyle = "green"
    context.fillRect(0, 0, canvas.width, canvas.height)
    if (arena.endCell) {
        context.fillStyle = "red"
        drawHexagon(arena.endCell, true)
        context.fillStyle = "brown"
        const path = arena.peasant.position.pathTo(arena.endCell)
        for (const location of path) {
            drawHexagon(location, true);
        }
    }
    context.fillStyle = "black"
    drawHexagon(arena.peasant.position, true)
    drawUnit(arena.peasant)
    context.strokeStyle = "white";
    for (const y of arena.rows) {
        for (const x of arena.columns) {
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
    if (cell && cell.isInRange(arena.columns, arena.rows)) {
        arena.endCell = cell
    } else {
        arena.endCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    const cell = screenToCell(new Point(ev.offsetX, ev.offsetY))
    if (!cell?.isInRange(arena.columns, arena.rows)) {
        return
    }
    arena.peasant.moveTo(cell)
}