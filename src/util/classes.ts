import { lerp } from "./functions"

export class Point {
    constructor(public x: number, public y: number) {
        this.x = x
        this.y = y
    }

    isSameAs(cell: Point): boolean {
        return this.x == cell.x && this.y == cell.y
    }

    clone(): Point {
        return new Point(this.x, this.y)
    }

    add1(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y)
    }

    add2 = (p: Point) => new Point(this.x + p.x, this.y + p.y)

    // add3(p: Point) => new Point(this.x + p.x, this.y + p.y)

    subtract(p: Point) {
        return new GridCell(this.x - p.x, this.y - p.y)
    }

    normalize() {
        const f = 1 / Math.sqrt(this.squareLength())
        return new GridCell(this.x * f, this.y * f)
    }

    squareLength() {
        return this.x * this.x + this.y * this.y
    }

    lerp(to: Point, gradient: number) {
        return new Point(
            lerp(this.x, to.x, gradient),
            lerp(this.y, to.y, gradient)
        )
    }

    as<T extends Point>(type: new (x: number, y: number) => T) {
        return new type(this.x, this.y)
    }

    squareDistanceTo(p: Point): any {
        return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y)
    }
}

export class GridCell extends Point {
    private static readonly sides = [[2, 0], [1, -1], [-1, -1], [-2, 0], [-1, 1], [1, 1]]

    get isValid(): boolean {
        return (this.x & 1) == (this.y & 1)
    }

    squareDistanceTo(cell: GridCell): number {
        return (this.x - cell.x) * (this.x - cell.x) * 3 / 4 + (this.y - cell.y) * (this.y - cell.y) * 9 / 4
    }

    distanceTo(cell: GridCell): number {
        return Math.sqrt(this.squareDistanceTo(cell))
    }

    isInRange(rangeX: number[], rangeY: number[]): boolean {
        return rangeX.includes(this.x) && rangeY.includes(this.y)
    }

    getNeighbor(side: number): GridCellNeighbor {
        const xy = GridCell.sides[side]
        return new GridCellNeighbor(this.x + xy[0], this.y + xy[1], side)
    }

    getNeighbors(): GridCellNeighbor[] {
        return GridCell.sides.map((xy, index) => new GridCellNeighbor(this.x + xy[0], this.y + xy[1], index))
    }

    clone(): GridCell {
        return new GridCell(this.x, this.y)
    }
}

export class GridCellNeighbor extends GridCell {
    constructor(x: number, y: number, public side: number) {
        super(x, y)
    }
}

export class PathCell extends GridCell {
    constructor(cell: GridCell, public step: number) {
        super(cell.x, cell.y)
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