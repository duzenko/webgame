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

export class Swordsman extends Unit {
    name = 'Swordsman'
    imageName = 'swordsman.png'
    speed = 3
}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    imageName = 'wolf.png'
}

export const testUnits = [
    new Wolf(8, 0),
    new Wolf(9, 1),
    new Wolf(9, -1),
    new Swordsman(-8, 0),
    new Peasant(-9, 1),
    new Peasant(-9, -1),
].sort((a, b) => {
    const r = b.speed - a.speed
    if (r) return r
    return b.position.y - a.position.y
})

