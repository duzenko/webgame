import { GridCell } from "./classes"

export abstract class Unit {
    position: GridCell
    isAlive = true
    isEnemy = false
    speed = 2
    actionPoints = 0
    name = 'none'
    imageName = 'none'

    constructor(x: number, y: number) {
        this.position = new GridCell(x, y)
        // this.image.src = './img/unit/' + this.imageName
    }

    canMoveTo(cell: GridCell): boolean {
        const path = this.position.pathTo(cell)
        return path.length < this.actionPoints
    }

    moveTo(cell: GridCell) {
        this.position = cell
    }

    resetActionPoints() {
        this.actionPoints = this.speed
    }

}

export class Peasant extends Unit {
    name = 'Peasant'
    imageName = 'peasant.png'
}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    imageName = 'wolf.png'
}

export const testUnits = [
    new Wolf(8, 0),
    new Peasant(-8, 0),
    new Wolf(8, 2),
    new Peasant(-8, 2)
]

