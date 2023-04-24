import { GridCell } from "../util/classes"
import { UnitStack } from "./unit-stack"

export abstract class Unit {
    speed = 2
    health = 1
    name = 'none'
    imageName = 'none'

    constructor() { }

    get damage(): number {
        return Math.ceil(this.health / 3)
    }
}

export class Peasant extends Unit {
    name = 'Peasant'
    imageName = 'peasant.png'
    health = 6
}

export class Swordsman extends Unit {
    name = 'Swordsman'
    imageName = 'swordsman.png'
    health = 35
    speed = 3
}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    health = 24
    imageName = 'wolf.png'
}

export const playerArmy = [
    new UnitStack(Swordsman, 1),
    new UnitStack(Peasant, 1),
    new UnitStack(Peasant, 1),
]
export const enemyArmy = [
    new UnitStack(Wolf, 1),
    new UnitStack(Wolf, 1),
    new UnitStack(Wolf, 1),
]