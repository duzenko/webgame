import { Projectile } from "../game/projectile";
import { UnitStack } from "../game/unit-stack";


class GameImages {
    loadingImages = new Map()
    loadedImages = new Map()
    private doneCallback: (() => void) | undefined

    getByName(imageName: string): ImageBitmap | undefined {
        if (this.loadedImages.has(imageName)) return this.loadedImages.get(imageName)
        if (this.loadingImages.has(imageName)) return undefined
        const image = new Image()
        image.src = '/img/' + imageName
        image.onload = () => {
            this.loadingImages.delete(imageName)
            this.loadedImages.set(imageName, image)
            if (!this.loadingImages.size) {
                this.doneCallback?.()
            }
        }
        this.loadingImages.set(imageName, image)
        return undefined
    }

    getForStack(stack: UnitStack): ImageBitmap | undefined {
        return this.getByName(`unit/${stack.type.imageName}${stack.isAlive ? '' : '-dead'}.png`)
    }

    getForProjectile(projectile: Projectile): ImageBitmap | undefined {
        return this.getByName(`projectile/${projectile.imageName}.png`)
    }

    allLoaded(): Promise<void> {
        return new Promise(resolve => {
            if (this.loadingImages.size)
                this.doneCallback = resolve
            else
                resolve()
        })
    }
}

export const gameImages = new GameImages()

