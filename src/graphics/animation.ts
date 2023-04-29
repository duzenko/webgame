import { RangedAttackAnimation } from "../game/animation"
import { cellToScreen, context } from "./canvas"
import { getImageByName } from "./image"

export function drawProjectile(animation: RangedAttackAnimation) {
    const image = getImageByName('projectile/stone.png')
    if (!image) return
    const p = cellToScreen(animation.position)
    context.drawImage(image, p.x, p.y)
}