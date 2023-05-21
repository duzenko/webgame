import { checkSize, drawGrid, drawMoveableCells, drawPossiblePath, screenToCell, drawBackground, drawCursor, drawUnits, cellToScreen, drawAnimations } from "../graphics/canvas"
import { arena } from "../game/arena";
import { VSyncAnimation } from "../game/animation";
import { Point } from "../util/classes";
import { hideModal, showModal } from "../util/modal";
import { gameImages } from "../graphics/image";
import { Player } from "../game/player";

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export const context = canvas?.getContext("2d") as CanvasRenderingContext2D
const powerSavingMode = false // notebooks on battery
export let cursorPosition: Point | undefined

export async function loadArena() {
    showModal('Loading...')
    canvas.addEventListener('mousemove', onMouseMove, false)
    canvas.addEventListener('mousedown', onMouseDown, false)
    window.addEventListener('keydown', onKeyDown, false)
    window.addEventListener('resize', present, false)
    canvas.addEventListener('mouseleave', onMouseLeave, false)
    await arena.load()
    if (powerSavingMode) {
        window.setInterval(present, 100)
    } else {
        window.requestAnimationFrame(present)
    }
    setTimeout(async () => {
        await gameImages.allLoaded()
        hideModal()
        arena.start()
    }, 99)
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
        Player.selectedCell = cell
        Player.selectedCellSide = undefined
        if (arena.activeStack.onPlayerTeam && arena.getStackInCell(cell)) {
            const vector = cursorPosition.subtract(cellToScreen(cell)).normalize()
            const angle = Math.acos(vector.x) / Math.PI * 3
            let side = Math.round(angle)
            side = vector.y > 0 ? side : (6 - side) % 6
            const neighborCell = cell.getNeighbor(side)
            if (neighborCell.isSameAs(arena.activeStack.position))
                Player.selectedCellSide = neighborCell
            else {
                const moves = arena.movesForActiveStack
                if (moves.some(m => m.isSameAs(neighborCell) && m.step < arena.activeStack.actionPoints && (!arena.getStackInCell(m) || arena.getStackInCell(m) == arena.activeStack)))
                    Player.selectedCellSide = neighborCell
            }
        }
    } else {
        Player.selectedCell = undefined
    }
}

function onMouseDown(ev: MouseEvent) {
    if (arena.animation || !Player.selectedCell) return
    if (Player.selectedStack && arena.activeStack.type.rangedAttack) {
        arena.rangedAttack(Player.selectedStack)
        return
    }
    if (arena.unitCanMoveTo(arena.activeStack, Player.selectedCell)) {
        Player.moveActiveUnit()
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