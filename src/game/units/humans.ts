import { ArrowProjectile, StoneProjectile } from "../projectile"
import { Unit, knownUnits } from "./unit"

export class Peasant extends Unit {
    name = 'Peasant'
    imageName = 'peasant'
    health = 6
}
knownUnits['Peasant'] = Peasant

export class Slinger extends Unit {
    name = 'Slinger'
    imageName = 'ladyslinger'
    health = 12
    rangedAttack = StoneProjectile
}
knownUnits['Slinger'] = Slinger

export class Pikeman extends Unit {
    name = 'Pikeman'
    imageName = 'pikeman'
    health = 20
}
knownUnits['Pikeman'] = Pikeman

export class Robber extends Unit {
    name = 'Robber'
    imageName = 'villain'
    health = 20
}
knownUnits['Robber'] = Robber

export class Archer extends Unit {
    name = 'Archer'
    imageName = 'ladyarcher'
    health = 34
    rangedAttack = ArrowProjectile
}
knownUnits['Archer'] = Archer

export class Swordsman extends Unit {
    name = 'Swordsman'
    imageName = 'swordsman'
    health = 35
    speed = 3
}
knownUnits['Swordsman'] = Swordsman
