import { canvas, checkSize, context, drawGrid, fillHexagon, drawMoveableCells, drawPossiblePath, drawUnit, screenToCell, drawBackground, cursorPosition, drawCursor } from "./graphics/canvas"
import { arena } from "./game/arena";
import { Point } from "./util/classes"
import { VSyncAnimation } from "./game/animation";

export let debugLines: { color: string, p1: Point, p2: Point }[] = [];

canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mousedown', onMouseDown, false)
window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('resize', present, false)
window.setInterval(present, 8)

function present() {
    checkSize()
    drawAll()
}

function drawAll() {
    VSyncAnimation.runAllFrames()
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
    drawCursor()
    debugLines = []
}

function onMouseMove(ev: MouseEvent) {
    cursorPosition.x = ev.offsetX
    cursorPosition.y = ev.offsetY
    const cell = screenToCell(cursorPosition)
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

function onKeyDown(ev: KeyboardEvent) {
    if (arena.animation) return
    if (arena.activeUnit.isEnemy) return
    if (ev.key == ' ') arena.endMove()
}