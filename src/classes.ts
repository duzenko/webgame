export class Point {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    squareDistanceTo(p: Point): number {
        return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y)
    }

}

function isValidCell(x: number, y: number): boolean {
    return (x & 1) == (y & 1)
}

export class GridCell extends Point {

    isSameAs(cell: GridCell): boolean {
        return this.x == cell.x && this.y == cell.y
    }

    isValid(): boolean {
        return isValidCell(this.x, this.y)
    }

    pathTo(end: GridCell): GridCell[] {
        const path = []
        var x = this.x
        var y = this.y
        while (path.length < 33) {
            if (Math.abs(end.x - x) > Math.abs(end.y - y)) {
                x += Math.sign(end.x - x) * 2
            } else {
                y += Math.sign(end.y - y)
                x += Math.sign(end.x - x)
            }
            if (end.x == x && !isValidCell(x, y)) {
                x++
            }
            if (x == end.x && y == end.y) break
            path.push(new GridCell(x, y))
        }
        return path
    }

    isInRange(rangeX: number[], rangeY: number[]): boolean {
        return rangeX.includes(this.x) && rangeY.includes(this.y)
    }

}
