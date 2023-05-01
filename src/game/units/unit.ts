import { ArrowProjectile, Projectile, StoneProjectile } from "../projectile"
import { UnitStack } from "../unit-stack"

export abstract class Unit {
    speed = 2
    health = 1
    name = 'none'
    imageName = 'none'
    rangedAttack?: new () => Projectile

    constructor() { }

    get damage(): number {
        return Math.ceil(this.health / 3)
    }
}

export const knownUnits: { [index: string]: new () => Unit } = {}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    health = 24
    imageName = 'wolf'
}
knownUnits['Wolf'] = Wolf
console.log(knownUnits)
