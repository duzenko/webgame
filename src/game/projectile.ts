import { GridCell } from "../util/classes"

export class ArenaObject {
    position = new GridCell(NaN, NaN)
    xMirrored = false // looking left instead of right
    animationSpeedInverse = 144
}

export abstract class Projectile extends ArenaObject {
    imageName!: string
    animationSpeedInverse = 77
}

export class StoneProjectile extends Projectile {
    imageName = 'stone'
}

export class ArrowProjectile extends Projectile {
    imageName = 'arrow'
}