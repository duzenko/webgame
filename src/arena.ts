import { GameAnimation } from "./animation"
import { GridCell } from "./classes"

function range(start: number, end: number) {
    return Array.apply(null, Array(end - start + 1)).map((v, i) => i + start)
}

export abstract class Unit {
    position: GridCell
    image = new Image()

    constructor(position: GridCell) {
        this.position = position
        this.image.src = './img/unit/' + this.getImageName()
    }

    moveTo(cell: GridCell) {
        this.position = cell
    }

    abstract getImageName(): string;
}

class Peasant extends Unit {
    getImageName(): string {
        return 'peasant.png'
    }
}


class Wolf extends Unit {
    getImageName(): string {
        return 'wolf.png'
    }
}

class Arena {
    columns = range(-9, 9)
    rows = range(-3, 3)
    peasant = new Peasant(new GridCell(-8, 0))
    wolf = new Wolf(new GridCell(8, 0))
    selectedCell?: GridCell
    animation?: GameAnimation

    moveUnit(unit: Unit, destination: GridCell) {
        this.animation = UnitMoveAnimation.create(unit, destination)
    }
}

export const arena = new Arena()

class UnitMoveAnimation extends GameAnimation {
    unit: Unit
    destination: GridCell
    path: GridCell[]

    static create(unit: Unit, destination: GridCell): UnitMoveAnimation {
        const path = unit.position.pathTo(destination)
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(unit: Unit, destination: GridCell, path: GridCell[]) {
        super(path.length + 1, 333)
        this.path = path
        this.unit = unit
        this.destination = destination
    }

    frame(frameNo: number): void {
        if (frameNo < this.path.length) {
            this.unit.moveTo(this.path[frameNo])
        } else {
            this.unit.moveTo(this.destination)
        }
    }

    ended(): void {
        arena.animation = undefined
        arena.selectedCell = undefined
    }

}