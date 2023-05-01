import { checkSize, drawGrid, fillHexagon, drawMoveableCells, drawPossiblePath, drawUnit, screenToCell, drawBackground, drawCursor, drawUnits, cellToScreen, drawAnimations } from "./graphics/canvas"
import { arena } from "./game/arena";
import { VSyncAnimation } from "./game/animation";
import { Point } from "./util/classes";
import { hideModal, showModal } from "./util/modal";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export const context = canvas.getContext("2d") as CanvasRenderingContext2D
const powerSavingMode = false // notebooks on battery
export let cursorPosition: Point | undefined

canvas.addEventListener('mousemove', onMouseMove, false)
canvas.addEventListener('mousedown', onMouseDown, false)
window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('resize', present, false)
canvas.addEventListener('mouseleave', onMouseLeave, false)

loadArena()

async function loadArena() {
    showModal('Loading...')
    await arena.load()
    if (powerSavingMode) {
        window.setInterval(present, 100)
    } else {
        window.requestAnimationFrame(present)
    }
    hideModal()
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
    drawAnimations()
    drawCursor()
}

function onMouseMove(ev: MouseEvent) {
    cursorPosition = new Point(ev.offsetX, ev.offsetY)
    const cell = screenToCell(cursorPosition)
    if (arena.isCellValid(cell)) {
        arena.selectedCell = cell
        arena.selectedCellSide = undefined
        if (arena.activeStack.onPlayerTeam && arena.getStackInCell(cell)) {
            const vector = cursorPosition.subtract(cellToScreen(cell)).normalize()
            const angle = Math.acos(vector.x) / Math.PI * 3
            let side = Math.round(angle)
            side = vector.y > 0 ? side : (6 - side) % 6
            const neighborCell = cell.getNeighbor(side)
            if (neighborCell.isSameAs(arena.activeStack.position))
                arena.selectedCellSide = neighborCell
            else {
                const moves = arena.movesForActiveStack
                if (moves.some(m => m.isSameAs(neighborCell) && m.step < arena.activeStack.actionPoints && (!arena.getStackInCell(m) || arena.getStackInCell(m) == arena.activeStack)))
                    arena.selectedCellSide = neighborCell
            }
        }
    } else {
        arena.selectedCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    if (arena.animation || !arena.selectedCell) return
    if (arena.selectedStack && arena.activeStack.type.rangedAttack) {
        arena.rangedAttack(arena.selectedStack)
        return
    }
    if (arena.unitCanMoveTo(arena.activeStack, arena.selectedCell)) {
        arena.moveActiveUnit()
        return
    }
}

function onKeyDown(ev: KeyboardEvent) {
    if (arena.animation) return
    if (!arena.activeStack.onPlayerTeam) return
    if (ev.key == ' ') arena.endMove()
}

function onMouseLeave(ev: MouseEvent) {
    cursorPosition = undefined
}