import { Projectile } from "../game/projectile";
import { UnitStack } from "../game/unit-stack";

const loadingImages = new Map(), loadedImages = new Map()

export function getImageByName(imageName: string): ImageBitmap | undefined {
    if (loadedImages.has(imageName)) return loadedImages.get(imageName)
    if (loadingImages.has(imageName)) return undefined
    const image = new Image()
    image.src = '/img/' + imageName
    image.onload = () => {
        loadingImages.delete(imageName)
        loadedImages.set(imageName, image)
    }
    loadingImages.set(imageName, image)
    return undefined
}

export function getImageForStack(stack: UnitStack): ImageBitmap | undefined {
    return getImageByName(`unit/${stack.type.imageName}${stack.isAlive ? '' : '-dead'}.png`)
}

export function getImageForProjectile(projectile: Projectile): ImageBitmap | undefined {
    return getImageByName(`projectile/${projectile.imageName}.png`)
}