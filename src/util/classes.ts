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

    isSameAs(cell: Point): boolean {
        return this.x == cell.x && this.y == cell.y
    }

    clone(): GridCell {
        return new GridCell(this.x, this.y)
    }
}

function isValidCell(x: number, y: number): boolean {
    return (x & 1) == (y & 1)
}

export class GridCell extends Point {

    get isValid(): boolean {
        return isValidCell(this.x, this.y)
    }

    isInRange(rangeX: number[], rangeY: number[]): boolean {
        return rangeX.includes(this.x) && rangeY.includes(this.y)
    }

    getNeighbors(): GridCell[] {
        return [[-2, 0], [2, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]].map(xy => new GridCell(this.x + xy[0], this.y + xy[1]))
    }
}

declare global {
    interface Array<T> {
        first(): T
        last(): T
    }
}

Array.prototype.first = function () {
    if (!this.length) throw Error('Calling first() on empty array')
    return this[0]
}

Array.prototype.last = function () {
    if (!this.length) throw Error('Calling last() on empty array')
    return this[this.length - 1]
}