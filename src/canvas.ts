import { Point, GridCell } from "./classes"
import { Unit } from "./arena"

export const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement
export const context = canvas.getContext("2d") as CanvasRenderingContext2D

const cellRadius = 48
const cellStepX = cellRadius * Math.sin(Math.PI / 3)
const cellStepY = cellRadius * 1.5

function cellToScreen(cell: GridCell): Point {
    const x = cell.x * cellStepX + canvas.width / 2
    const y = cell.y * cellRadius * 1.5 + canvas.height / 2
    return new Point(x, y)
}

export function screenToCell(p: Point): GridCell | undefined {
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
        if (m.p.isValid())
            return m.p
    }
    return undefined
}

export function checkSize() {
    // const width = Math.round(window.devicePixelRatio * canvas.clientWidth)
    // const height = Math.round(window.devicePixelRatio * canvas.clientHeight)
    const width = Math.round(canvas.clientWidth)
    const height = Math.round(canvas.clientHeight)
    if (canvas.width != width || canvas.height != height) {
        console.log("Resize canvas from", canvas.width, 'x', canvas.height, "to", width, 'x', height)
        canvas.width = width;
        canvas.height = height;
    }
}

function doHexagonPath(cellCenter: Point) {
    const angle = 2 * Math.PI / 6
    context.beginPath()
    for (let i = 0; i < 6; i++) {
        const xx = cellCenter.x + cellRadius * Math.sin(angle * i)
        const yy = cellCenter.y + cellRadius * Math.cos(angle * i)
        context.lineTo(xx, yy)
    }
    context.closePath()
}

export function drawHexagon(cell: GridCell, fill: boolean) {
    const p = cellToScreen(cell)
    doHexagonPath(p)
    if (fill) {
        context.fill()
    } else {
        context.stroke()
    }
}

export function drawUnit(unit: Unit) {
    const center = cellToScreen(unit.position)
    const image = unit.image
    const imageScale = Math.max(cellStepX / image.width, cellRadius / image.height)
    const width = image.width * imageScale
    const height = image.height * imageScale
    context.save()
    doHexagonPath(center)
    context.clip()
    context.drawImage(image, center.x - width, center.y - height, 2 * width, 2 * height)
    context.restore()
}