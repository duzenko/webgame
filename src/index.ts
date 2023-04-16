import { canvas, checkSize, context, drawGrid, drawHexagon, drawMoveableCells, drawPossiblePath, drawUnit, screenToCell } from "./canvas"
import { Point } from "./classes"
import { arena } from "./arena";

export let debugLines: { color: string, p1: Point, p2: Point }[] = [];

canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mousedown', onMouseDown, false)
window.addEventListener('resize', present, false)
window.setInterval(present, 8)

function present() {
    checkSize()
    drawAll()
}

function drawAll() {
    context.fillStyle = "green"
    context.fillRect(0, 0, canvas.width, canvas.height)
    drawPossiblePath()
    context.fillStyle = 'rgba(0,0,0,' + Math.abs(Math.sin(new Date().getTime() * 1e-3)) + ')'
    drawHexagon(arena.activeUnit.position, true)
    drawMoveableCells()
    drawGrid()
    arena.units.filter(u => !u.isAlive).forEach(drawUnit)
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
    if (arena.isCellValid(cell)) {
        arena.selectedCell = cell
    } else {
        arena.selectedCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    if (arena.animation) return
    const cell = screenToCell(new Point(ev.offsetX, ev.offsetY))
    if (!arena.isCellValid(cell) || !arena.activeUnit.canMoveTo(cell)) {
        return
    }
    arena.moveUnit(arena.activeUnit, cell)
}