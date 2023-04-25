import { canvas, checkSize, context, drawGrid, fillHexagon, drawMoveableCells, drawPossiblePath, drawUnit, screenToCell, drawBackground, cursorPosition, drawCursor, drawUnits, cellToScreen } from "./graphics/canvas"
import { arena } from "./game/arena";
import { Point } from "./util/classes"
import { VSyncAnimation } from "./game/animation";

export let debugLines: { color: string, p1: Point, p2: Point }[] = [];
const powerSavingMode = false // notebooks on battery

canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mousedown', onMouseDown, false)
window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('resize', present, false)
if (powerSavingMode) {
    window.setInterval(present, 100)
} else {
    window.requestAnimationFrame(present)
}

function present() {
    checkSize()
    drawAll()
    if (!powerSavingMode) {
        window.requestAnimationFrame(present)
    }
}

function drawAll() {
    VSyncAnimation.runAllFrames()
    drawBackground()
    drawPossiblePath()
    drawMoveableCells()
    drawGrid()
    drawUnits()
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
        arena.selectedCellSide = undefined
        if (arena.activeUnit.onPlayerTeam && arena.getStackInCell(cell)) {
            const vector = cursorPosition.subtract(cellToScreen(cell)).normalize()
            const angle = Math.acos(vector.x) / Math.PI * 3
            let side = Math.round(angle)
            side = vector.y > 0 ? side : (6 - side) % 6
            const neighborCell = cell.getNeighbor(side)
            if (neighborCell.isSameAs(arena.activeUnit.position))
                arena.selectedCellSide = neighborCell
            else {
                const moves = arena.getMovesForUnit(arena.activeUnit)
                if (moves.some(m => m.isSameAs(neighborCell) && m.step < arena.activeUnit.actionPoints && (!arena.getStackInCell(m) || arena.getStackInCell(m) == arena.activeUnit)))
                    arena.selectedCellSide = neighborCell
            }
        }
    } else {
        arena.selectedCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    if (arena.animation || !arena.selectedCell) return
    if (!arena.unitCanMoveTo(arena.activeUnit, arena.selectedCell)) {
        return
    }
    arena.moveActiveUnit()
}

function onKeyDown(ev: KeyboardEvent) {
    if (arena.animation) return
    if (arena.activeUnit.isEnemy) return
    if (ev.key == ' ') arena.endMove()
}