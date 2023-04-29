export abstract class Projectile {
    imageName!: string
}

export class StoneProjectile extends Projectile {
    imageName = 'stone'
}

export class ArrowProjectile extends Projectile {
    imageName = 'arrow'
}