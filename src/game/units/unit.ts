import { ArrowProjectile, Projectile, StoneProjectile } from "../projectile"
import { UnitStack } from "../unit-stack"

export abstract class Unit {
    speed = 2
    health = 1
    attack = 1
    defence = 1
    damage = 1
    name = 'none'
    imageName = 'none'
    rangedAttack?: new () => Projectile

    get plural() {
        if (this.name.endsWith('f')) return this.name.replace(/.$/, "ves")
        return this.name + 's'
    }
}

export const knownUnits: { [index: string]: new () => Unit } = {}

export class Wolf extends Unit {
    isEnemy = true
    speed = 3
    name = 'Wolf'
    health = 24
    imageName = 'wolf'
    attack = 10
    defence = 6
    damage = 4.5
}
knownUnits['Wolf'] = Wolf
