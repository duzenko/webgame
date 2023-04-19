import { canvas, checkSize, context, drawGrid, fillHexagon, drawMoveableCells, drawPossiblePath, drawUnit, screenToCell, drawBackground } from "./graphics/canvas"
import { arena } from "./game/arena";
import { Point } from "./util/classes"

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
    drawBackground()
    drawPossiblePath()
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
    if (!arena.isCellValid(cell) || !arena.unitCanMoveTo(arena.activeUnit, cell)) {
        return
    }
    arena.moveUnit(arena.activeUnit, cell)
}