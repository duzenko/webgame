import { GridCell } from "./classes"

function range(start: number, end: number) {
    return Array.apply(null, Array(end - start + 1)).map((v, i) => i + start)
}

export abstract class Unit {
    position: GridCell
    image = new Image()

    constructor(position: GridCell) {
        this.position = position
        console.log(this.getImageName())
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

export const arena: {
    peasant: Peasant
    endCell?: GridCell
    columns: number[]
    rows: number[]
} = {
    peasant: new Peasant(new GridCell(-8, 0)),
    columns: range(-9, 9),
    rows: range(-3, 3)
}