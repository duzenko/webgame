import { Point, GridCell } from "../util/classes"
import { arena } from "../game/arena"
import { UnitStack } from "../game/unit-stack"
import { canvas, context, cursorPosition } from "../pages/arena"
import { gameImages } from "./image"
import { RangedAttackAnimation } from "../game/complex-animation"
import { Projectile } from "../game/projectile"
import { DamageStatsAnimation, SmoothMoveAnimation, VSyncAnimation } from "../game/animation"

let cellRadius: number
let cellStepX: number
let cellStepY: number
let isometricAspect: number
let arenaZoom: number
let gridCenterY: number

export function cellToScreen(cell: GridCell): Point {
    const x = canvas.width / 2 + cell.x * cellStepX
    const y = gridCenterY - cell.y * cellRadius * 1.5 * isometricAspect
    return new Point(x, y)
}

export function screenToCell(p: Point): GridCell {
    let x0 = Math.floor((p.x - canvas.width / 2) / cellStepX)
    let y0 = Math.floor((gridCenterY - p.y) / cellStepY)
    const corners = [
        new GridCell(x0, y0),
        new GridCell(x0 + 1, y0),
        new GridCell(x0, y0 + 1),
        new GridCell(x0 + 1, y0 + 1),
    ]
    const measured = corners.filter((c) => c.isValid).map((c) => {
        return { p: c, d: p.squareDistanceTo(cellToScreen(c)), t: cellToScreen(c) }
    })
    measured.sort((a, b) => a.d - b.d)
    for (const m of measured) {
        if (m.p.isValid)
            return m.p
    }
    throw null
}

export function checkSize() {
    // TODO support hi-dpi screens
    // const width = Math.round(window.devicePixelRatio * canvas.clientWidth)
    // const height = Math.round(window.devicePixelRatio * canvas.clientHeight)
    const width = Math.round(canvas.clientWidth)
    const height = Math.round(canvas.clientHeight)
    if (canvas.width != width || canvas.height != height) {
        let xScale = width / (arena.columns.length + 3) / Math.sin(Math.PI / 3)
        let yScale = height / (arena.rows.length + 3) / 1.5
        if (yScale < xScale) { // dynamic aspect ratio
            xScale = Math.min(yScale / 0.7, xScale)
            isometricAspect = yScale / xScale
            yScale = xScale
        } else {
            isometricAspect = 1
        }
        arenaZoom = Math.min(xScale, yScale)
        console.log(`Resize canvas from ${canvas.width}x${canvas.height} to ${width}x${height}, scale to ${arenaZoom.toFixed()}`)
        canvas.width = width
        canvas.height = height
        cellRadius = arenaZoom
        cellStepX = cellRadius * Math.sin(Math.PI / 3)
        cellStepY = cellRadius * 1.5 * isometricAspect
        gridCenterY = height * 0.6
    }
}

function doHexagonPath(cellCenter: Point, scale: number = 1) {
    const angle = 2 * Math.PI / 6
    context.beginPath()
    for (let i = 0; i < 6; i++) {
        const xx = cellCenter.x + cellRadius * Math.sin(angle * i) * scale
        const yy = cellCenter.y + cellRadius * isometricAspect * Math.cos(angle * i) * scale
        context.lineTo(xx, yy)
    }
    context.closePath()
}

export function fillHexagon(cell: GridCell) {
    const p = cellToScreen(cell)
    doHexagonPath(p)
    context.fill()
}

export function strokeHexagon(cell: GridCell, scale: number = 1) {
    const p = cellToScreen(cell)
    doHexagonPath(p, scale)
    context.stroke()
}

export function drawUnit(stack: UnitStack) {
    const center = cellToScreen(stack.position)
    context.save()
    try {
        if (stack == arena.activeStack && stack.onPlayerTeam) {
            context.lineWidth = 15
            context.strokeStyle = 'rgba(232,253,1, 0.5)'
            strokeHexagon(arena.activeStack.position, 0.9)
        }
        const image = gameImages.getForStack(stack)
        if (image) {
            const imageScale = 2 * cellStepX / image.width
            const width = image.width * imageScale
            const height = image.height * imageScale
            if (!stack.isAlive) {
                context.globalAlpha = 0.7
            }
            if (stack.xMirrored) {
                context.scale(-1, 1)
                context.drawImage(image, -center.x + width / 2, center.y + cellRadius - height, -width, height)
            } else
                context.drawImage(image, center.x - width / 2, center.y + cellRadius - height, width, height)
        }
    } finally {
        context.restore()
    }
    drawUnitBadge(center.x, center.y + cellRadius * isometricAspect * 0.3, stack)
}

function drawUnitBadge(x: number, y: number, unit: UnitStack) {
    const index = arena.stacks.filter(u => u.isAlive).indexOf(unit) + 1
    if (index < 1) return
    context.fillStyle = 'green'
    context.fillRect(x - cellRadius / 2, y - cellRadius * 0.1, cellRadius * unit.health / unit.type.health, cellRadius * 0.08)
    context.fillStyle = 'black'
    context.fillRect(x - cellRadius / 2 + cellRadius * unit.health / unit.type.health, y - cellRadius * 0.12, cellRadius * (1 - unit.health / unit.type.health), cellRadius * 0.1)
    const fontSize = Math.round(cellRadius * isometricAspect / 16) * 4
    context.font = `${fontSize}px Artifika`

    context.fillStyle = 'black'
    context.fillRect(x + fontSize * 0.8, y, fontSize * 1.4, fontSize * 1.2)
    context.fillStyle = 'gold'
    context.fillText(index.toString(), x + fontSize * 1.5, y + fontSize * 0.95)

    context.fillStyle = unit.onPlayerTeam ? 'Blue' : 'Crimson'
    context.fillRect(x - fontSize * 0.8, y, fontSize * 1.6, fontSize * 1.2)
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.fillText(unit.qty.toString(), x, y + fontSize * 0.95)
}

export function drawPossiblePath() {
    const destination = arena.selectedCell
    if (!destination) return
    context.save()
    try {
        context.globalAlpha = 0.75
        context.fillStyle = "Khaki"
        const canMoveTo = arena.unitCanMoveTo(arena.activeStack, destination) && (arena.canActiveOccupySelected || arena.selectedCellSide)
        if (arena.activeStack.onPlayerTeam && canMoveTo) {
            const path = arena.getPathForUnitAndSide(arena.activeStack, destination, arena.selectedCellSide!)!
            for (const cell of [...path, destination]) {
                const p = cellToScreen(cell)
                context.beginPath()
                context.ellipse(p.x, p.y, 0.2 * cellRadius * isometricAspect, 0.2 * cellRadius * isometricAspect, 0, 2 * Math.PI, 0)
                context.closePath()
                context.fill()
            }
        }
        if (!canMoveTo) {
            context.fillStyle = "brown"
        }
        context.globalAlpha = 0.2
        context.fillStyle = "black"
        fillHexagon(destination)
    } finally {
        context.restore()
    }
}

export function drawMoveableCells() {
    const unit = arena.activeStack
    if (arena.animation || !unit.onPlayerTeam) return
    context.save()
    try {
        context.fillStyle = "black"
        context.globalAlpha = 0.2
        if (arena.selectedCell && !arena.selectedCell.isSameAs(arena.activeStack.position)) {
            const selectedUnit = arena.getStackInCell(arena.selectedCell)
            if (selectedUnit) {
                const cells = arena.getMovesForStack(selectedUnit)
                for (const cell of cells) {
                    fillHexagon(cell)
                }
            }
        }
        context.fillStyle = "black"
        context.globalAlpha = 0.3
        if (unit.onPlayerTeam && !arena.animation) {
            const cells = arena.getMovesForStack(unit)
            for (const cell of cells) {
                fillHexagon(cell)
            }
        }
    } finally {
        context.restore()
    }
}

export function drawGrid() {
    context.save()
    try {
        context.globalAlpha = 0.5
        context.strokeStyle = "white"
        for (const y of arena.rows) {
            for (const x of arena.columns) {
                const cell = new GridCell(x, y)
                if (cell.isValid) {
                    strokeHexagon(cell)
                }
            }
        }
    } finally {
        context.restore()
    }
}

export function drawBackground() {
    const backgroundImage = gameImages.getByName('field/green-terrain-v2.jpg')
    context.fillStyle = "black"
    context.fillRect(0, 0, canvas.width, canvas.height)
    if (backgroundImage) {
        const p = cellToScreen(new GridCell(arena.columns.first(), arena.rows.first()))
        const w = (canvas.width / 2 - p.x) * 1.6
        const h = (p.y - canvas.height / 2) * 1.25
        context.drawImage(backgroundImage, canvas.width / 2 - w, canvas.height / 2 - h, 2 * w, 2 * h)
    }
}

export function drawCursor() {
    if (!cursorPosition) return
    let cursorImage = 'not-allowed'
    const animationTick = Math.round(new Date().getTime() / 200)
    if (arena.animation || !arena.activeStack.onPlayerTeam) {
        cursorImage = 'wait-' + (animationTick % 6 + 1)
    } else {
        if (arena.selectedCell) {
            if (arena.selectedStack && arena.activeStack.type.rangedAttack && arena.selectedStack != arena.activeStack)
                cursorImage = `ranged-${animationTick % 3 + 1}`
            else if (arena.unitCanMoveTo(arena.activeStack, arena.selectedCell)) {
                if (arena.getStackInCell(arena.selectedCell)) {
                    if (arena.selectedCellSide)
                        cursorImage = `attack-${['w', 'nnw', 'nne', 'e', 'sse', 'ssw'][arena.selectedCellSide.side]}-${animationTick % 3 + 1}`
                    else
                        cursorImage = 'not-allowed'
                } else
                    cursorImage = 'move'
            }
        }
    }
    const image = gameImages.getByName(`cursor/${cursorImage}.png`)
    if (!image) return
    context.drawImage(image, cursorPosition.x - image.width / 2, cursorPosition.y - image.height / 2)
}

export function drawUnits() {
    arena.stacks.filter(u => !u.isAlive).forEach(drawUnit)
    arena.stacks.filter(u => u.isAlive).forEach(drawUnit)
}

export function drawAnimations() {
    for (const animation of VSyncAnimation.list) {
        if (animation instanceof SmoothMoveAnimation && animation.object instanceof Projectile) {
            drawProjectile(animation.object)
        }
        if (animation instanceof DamageStatsAnimation) {
            drawDamageStats(animation)
        }
    }
}

function drawProjectile(projectile: Projectile) {
    const image = gameImages.getForProjectile(projectile)
    if (!image) return
    const p = cellToScreen(projectile.position)
    context.drawImage(image, p.x, p.y)
}

function drawDamageStats(animation: DamageStatsAnimation) {
    let { x, y } = cellToScreen(animation.stack.position)
    y -= 1 * cellRadius
    context.save()
    try {
        context.globalAlpha = animation.opacity
        const fontSize = Math.round(cellRadius * isometricAspect * 0.5)
        context.font = `${fontSize}px Artifika`

        context.fillStyle = 'gold'
        if (animation.stats.killed) {
            context.fillText(animation.stats.damage.toString(), x - fontSize * 1.1, y + fontSize * 1 - animation.shift)
            context.fillStyle = 'red'
            context.fillText(animation.stats.killed.toString(), x + fontSize * 0.5, y + fontSize * 1.5 - animation.shift)
        } else
            context.fillText(animation.stats.damage.toString(), x, y - fontSize * 3 - animation.shift)
    } finally {
        context.restore()
    }
}
