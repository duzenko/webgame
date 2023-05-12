import { GridCell } from "../util/classes"

export class ArenaObject {
    position = new GridCell(NaN, NaN)
    xMirrored = false // looking left instead of right
}

export abstract class Projectile extends ArenaObject {
    imageName!: string
}

export class StoneProjectile extends Projectile {
    imageName = 'stone'
}

export class ArrowProjectile extends Projectile {
    imageName = 'arrow'
}