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
    attack = 10
    defence = 6
    damage = 3
}
knownUnits['Robber'] = Robber

export class Archer extends Unit {
    name = 'Archer'
    imageName = 'ladyarcher'
    health = 34
    rangedAttack = ArrowProjectile
    attack = 16
    defence = 10
    damage = 3.5
}
knownUnits['Archer'] = Archer

export class Swordsman extends Unit {
    name = 'Swordsman'
    imageName = 'swordsman'
    health = 35
    speed = 3
    attack = 10
    defence = 16
    damage = 4.5
}
knownUnits['Swordsman'] = Swordsman
