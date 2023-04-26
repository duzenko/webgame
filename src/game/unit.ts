import { UnitStack } from "./unit-stack"

export abstract class Unit {
    speed = 2
    health = 1
    name = 'none'
    imageName = 'none'
    rangedAttack = false

    constructor() { }

    get damage(): number {
        return Math.ceil(this.health / 3)
    }
}

export class Peasant extends Unit {
    name = 'Peasant'
    imageName = 'peasant'
    health = 6
}

export class Swordsman extends Unit {
    name = 'Swordsman'
    imageName = 'swordsman'
    health = 35
    speed = 3
}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    health = 24
    imageName = 'wolf'
}

export class Archer extends Unit {
    name = 'Archer'
    imageName = 'ladyarcher'
    health = 34
    rangedAttack = true
}

export class Pikeman extends Unit {
    name = 'Pikeman'
    imageName = 'pikeman'
    health = 20
}

export class Slinger extends Unit {
    name = 'Slinger'
    imageName = 'ladyslinger'
    health = 12
    rangedAttack = true
}

export class Robber extends Unit {
    name = 'Robber'
    imageName = 'villain'
    health = 20
}

export const playerArmy = [
    new UnitStack(Swordsman),
    new UnitStack(Peasant),
    new UnitStack(Archer),
    new UnitStack(Pikeman),
    new UnitStack(Slinger),
    new UnitStack(Robber),
]
export const enemyArmy = [
    new UnitStack(Wolf, 3),
    new UnitStack(Wolf),
    new UnitStack(Wolf),
]