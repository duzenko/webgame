import { canvas, checkSize, context, drawHexagon, drawUnit, screenToCell } from "./canvas"
import { GridCell, Point } from "./classes"
import { arena } from "./arena";

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
    if (arena.selectedCell) {
        context.fillStyle = "red"
        drawHexagon(arena.selectedCell, true)
        context.fillStyle = "brown"
        const path = arena.activeUnit.position.pathTo(arena.selectedCell)
        for (const location of path) {
            drawHexagon(location, true);
        }
    }
    context.fillStyle = 'rgba(0,0,0,' + Math.abs(Math.sin(new Date().getTime() * 1e-3)) + ')'
    drawHexagon(arena.activeUnit.position, true)
    context.strokeStyle = "white"
    for (const y of arena.rows) {
        for (const x of arena.columns) {
            const cell = new GridCell(x, y)
            if (cell.isValid()) {
                drawHexagon(cell, false)
            }
        }
    } arena.units.filter(u => !u.isAlive).forEach(drawUnit)
    arena.units.filter(u => u.isAlive).forEach(drawUnit)
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
    if (arena.animation) return
    const cell = screenToCell(new Point(ev.offsetX, ev.offsetY))
    if (cell && cell.isInRange(arena.columns, arena.rows)) {
        arena.selectedCell = cell
    } else {
        arena.selectedCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    if (arena.animation) return
    const cell = screenToCell(new Point(ev.offsetX, ev.offsetY))
    if (!cell?.isInRange(arena.columns, arena.rows)) {
        return
    }
    arena.moveUnit(arena.activeUnit, cell)
}