import { Point, GridCell } from "./classes"
import { Unit, arena } from "./arena"

export const canvas = document.getElementById("canvas") as HTMLCanvasElement
export const context = canvas.getContext("2d") as CanvasRenderingContext2D

let cellRadius: number
let cellStepX: number
let cellStepY: number
let arenaZoom = 1

function cellToScreen(cell: GridCell): Point {
    const x = cell.x * cellStepX + canvas.width / 2
    const y = cell.y * cellRadius * 1.5 + canvas.height / 2
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
    // const width = Math.round(window.devicePixelRatio * canvas.clientWidth)
    // const height = Math.round(window.devicePixelRatio * canvas.clientHeight)
    const width = Math.round(canvas.clientWidth)
    const height = Math.round(canvas.clientHeight)
    if (canvas.width != width || canvas.height != height) {
        arenaZoom = 1 / Math.max((arena.columns.length + 3) * Math.sin(Math.PI / 3) / width, (arena.rows.length * 1.5 + 1) / height)
        console.log(`Resize canvas from ${canvas.width}x${canvas.height} to ${width}x${height}, zoom to ${arenaZoom}`)
        canvas.width = width
        canvas.height = height
        cellRadius = arenaZoom
        cellStepX = cellRadius * Math.sin(Math.PI / 3)
        cellStepY = cellRadius * 1.5
    }
}

function doHexagonPath(cellCenter: Point, scale: number = 1) {
    const angle = 2 * Math.PI / 6
    context.beginPath()
    for (let i = 0; i < 6; i++) {
        const xx = cellCenter.x + cellRadius * Math.sin(angle * i) * scale
        const yy = cellCenter.y + cellRadius * Math.cos(angle * i) * scale
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

export function drawUnit(unit: Unit) {
    context.save()
    if (unit == arena.activeUnit) {
        context.lineWidth = 3
        context.strokeStyle = 'yellow'
        strokeHexagon(arena.activeUnit.position, 0.9)
    }
    const center = cellToScreen(unit.position)
    const image = unit.image
    const imageScale = 2 * Math.max(cellStepX / image.width, cellRadius / image.height)
    const width = image.width * imageScale
    const height = image.height * imageScale
    if (!unit.isAlive) {
        context.globalAlpha = 0.5
    }
    context.drawImage(image, center.x - width / 2, center.y + cellRadius - height, width, height)
    context.restore()
    drawBadge(center.x, center.y + cellRadius * 0.7, unit)
}

function drawBadge(x: number, y: number, unit: Unit) {
    const index = arena.units.filter(u => u.isAlive).indexOf(unit) + 1
    if (index < 1) return
    const fontSize = Math.round(cellRadius / 16) * 4
    context.beginPath()
    context.rect(x - fontSize * 0.8, y, fontSize * 1.6, fontSize * 1.2);
    context.fillStyle = unit.isEnemy ? 'Crimson' : 'Blue';
    context.fill();
    context.strokeStyle = 'white'
    context.stroke();
    context.closePath()
    context.font = `${fontSize}px sans-serif`
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.fillText(index.toString(), x, y + fontSize * 0.95);
}

export function drawPossiblePath() {
    const destination = arena.selectedCell
    if (!destination) {
        return
    }
    context.save()
    context.globalAlpha = 0.3
    context.fillStyle = "black"
    const canMoveTo = arena.activeUnit.canMoveTo(destination)
    if (!arena.activeUnit.isEnemy && canMoveTo) {
        const path = arena.activeUnit.position.pathTo(destination)
        for (const cell of path) {
            fillHexagon(cell)
        }
    }
    if (!canMoveTo) {
        context.fillStyle = "brown"
    }
    fillHexagon(destination)
    context.restore()
}

export function drawMoveableCells() {
    const unit = arena.activeUnit
    if (unit.isEnemy || arena.animation) return
    context.save()
    context.globalAlpha = 0.3
    context.fillStyle = "black"
    for (let y = -unit.speed; y <= unit.speed; y++) {
        for (let x = -2 * unit.speed; x <= 2 * unit.speed; x++) {
            const cell = new GridCell(unit.position.x + x, unit.position.y + y)
            if (!arena.isCellValid(cell)) continue
            if (!unit.canMoveTo(cell)) continue
            fillHexagon(cell)
        }
    }
    context.restore()
}

export function drawGrid() {
    context.strokeStyle = "white"
    for (const y of arena.rows) {
        for (const x of arena.columns) {
            const cell = new GridCell(x, y)
            if (cell.isValid) {
                strokeHexagon(cell)
            }
        }
    }
}