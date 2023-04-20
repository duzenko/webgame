import { GridCell } from "../util/classes"

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
    new Peasant(-9, 1),
    new Wolf(8, 0),
    new Peasant(-8, 0),
    new Wolf(9, 1),
]

