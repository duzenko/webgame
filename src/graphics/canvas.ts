import { Point, GridCell } from "../util/classes"
import { arena } from "../game/arena"
import { Unit } from "../game/unit"
import { getImageByName, getImageForUnit } from "./image"
import { UnitStack } from "../game/unit-stack"

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export const context = canvas.getContext("2d") as CanvasRenderingContext2D
export const cursorPosition = new Point(NaN, NaN)

let cellRadius: number
let cellStepX: number
let cellStepY: number
let isometricAspect: number
let arenaZoom: number

function cellToScreen(cell: GridCell): Point {
    const x = cell.x * cellStepX + canvas.width / 2
    const y = cell.y * cellRadius * 1.5 * isometricAspect + canvas.height / 2
    return new Point(x, y)
}

export function screenToCell(p: Point): GridCell {
    let x0 = Math.floor((p.x - canvas.width / 2) / cellStepX)
    let y0 = Math.floor((p.y - canvas.height / 2) / cellStepY)
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
        let yScale = height / (arena.rows.length + 1) / 1.5
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

export function drawUnit(unit: UnitStack) {
    const center = cellToScreen(unit.position)
    context.save()
    try {
        if (unit == arena.activeUnit) {
            context.lineWidth = 3
            context.strokeStyle = 'yellow'
            strokeHexagon(arena.activeUnit.position, 0.9)
        }
        const image = getImageForUnit(unit.type)
        if (image) {
            const imageScale = 2 * cellStepX / image.width
            const width = image.width * imageScale
            const height = image.height * imageScale
            if (!unit.isAlive) {
                context.globalAlpha = 0.5
            }
            context.drawImage(image, center.x - width / 2, center.y + cellRadius - height, width, height)
        }
    } finally {
        context.restore()
    }
    drawBadge(center.x, center.y + cellRadius * isometricAspect * 0.3, unit)
}

function drawBadge(x: number, y: number, unit: UnitStack) {
    const index = arena.stacks.filter(u => u.isAlive).indexOf(unit) + 1
    if (index < 1) return
    const fontSize = Math.round(cellRadius * isometricAspect / 16) * 4
    context.beginPath()
    context.rect(x - fontSize * 0.8, y, fontSize * 1.6, fontSize * 1.2);
    context.fillStyle = unit.isEnemy ? 'Crimson' : 'Blue';
    context.fill();
    context.strokeStyle = 'white'
    context.stroke();
    context.closePath()
    context.font = `${fontSize}px Artifika`
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.fillText(index.toString(), x, y + fontSize * 0.95);
}

export function drawPossiblePath() {
    const destination = arena.selectedCell
    if (!destination) return
    context.save()
    try {
        context.globalAlpha = 0.75
        context.fillStyle = "Khaki"
        const canMoveTo = arena.unitCanMoveTo(arena.activeUnit, destination)
        if (!arena.activeUnit.isEnemy && canMoveTo) {
            const path = arena.getPathForUnit(arena.activeUnit, destination)!
            for (const cell of [...path, destination]) {
                // fillHexagon(cell)
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
    const unit = arena.activeUnit
    if (arena.animation || !unit.onPlayerTeam) return
    context.save()
    try {
        context.fillStyle = "black"
        context.globalAlpha = 0.2
        if (arena.selectedCell && !arena.selectedCell.isSameAs(arena.activeUnit.position)) {
            const selectedUnit = arena.getUnitAt(arena.selectedCell)
            if (selectedUnit) {
                const cells = arena.getMovesForUnit(selectedUnit)
                for (const cell of cells) {
                    fillHexagon(cell)
                }
            }
        }
        context.fillStyle = "black"
        context.globalAlpha = 0.3
        if (!unit.isEnemy && !arena.animation) {
            const cells = arena.getMovesForUnit(unit)
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
    const backgroundImage = getImageByName('field/green-terrain.jpg')
    if (backgroundImage) {
        const p = cellToScreen(new GridCell(arena.columns[0], arena.rows[0]))
        const w = (canvas.width / 2 - p.x) * 1.6
        const h = (canvas.height / 2 - p.y) * 1.3
        context.drawImage(backgroundImage, canvas.width / 2 - w, canvas.height / 2 - h, 2 * w, 2 * h)
    } else {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    }
}

export function drawCursor() {
    let cursorImage = 'not-allowed'
    if (arena.animation || !arena.activeUnit.onPlayerTeam) {
        cursorImage = 'wait-' + (Math.round(new Date().getTime() / 200) % 6 + 1)
    } else {
        if (arena.selectedCell) {
            if (arena.unitCanMoveTo(arena.activeUnit, arena.selectedCell)) {
                cursorImage = arena.getUnitAt(arena.selectedCell) ? 'attack' : 'move'
            }
        }
    }
    const image = getImageByName(`cursors/${cursorImage}.png`)
    if (!image) return
    context.drawImage(image, cursorPosition.x - image.width / 2, cursorPosition.y - image.height / 2)
}

export function drawUnits() {
    arena.stacks.filter(u => !u.isAlive).forEach(drawUnit)
    arena.stacks.filter(u => u.isAlive).forEach(drawUnit)
}