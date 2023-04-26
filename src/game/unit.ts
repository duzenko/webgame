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

export class Archer extends Unit {
    name = 'Archer'
    imageName = 'ladyarcher.png'
    health = 12
    speed = 1
}
export class Pikeman extends Unit {
    name = 'Pikeman'
    imageName = 'pikeman.png'
    health = 12
    speed = 1
}
export class Slinger extends Unit {
    name = 'Slinger'
    imageName = 'ladyslinger.png'
    health = 12
    speed = 1
}
export class Villain extends Unit {
    name = 'Villain'
    imageName = 'villain.png'
    health = 12
    speed = 1
}


export const playerArmy = [
    new UnitStack(Swordsman),
    new UnitStack(Peasant),
    new UnitStack(Archer),
    new UnitStack(Pikeman),
    new UnitStack(Slinger),
    new UnitStack(Villain),
]
export const enemyArmy = [
    new UnitStack(Wolf, 3),
    new UnitStack(Wolf),
    new UnitStack(Wolf),
]