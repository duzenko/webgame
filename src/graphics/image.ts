import { Projectile } from "../game/projectile";
import { UnitStack } from "../game/unit-stack";

export abstract class GameImages {
    private static readonly loadingImages = new Map()
    private static readonly loadedImages = new Map()
    private static doneCallback: (() => void) | undefined

    static getByName(imageName: string): ImageBitmap | undefined {
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
        image.onerror = () => {
            this.loadingImages.delete(imageName)
            console.log('Failed to load image', image.src)
        }
        this.loadingImages.set(imageName, image)
        return undefined
    }

    static getForStack(stack: UnitStack): ImageBitmap | undefined {
        return this.getByName(`unit/${stack.type.imageName}${stack.isAlive ? '' : '-dead'}.png`)
    }

    static getForProjectile(projectile: Projectile): ImageBitmap | undefined {
        return this.getByName(`projectile/${projectile.imageName}.png`)
    }

    static getCursor(name: string) {
        return this.getByName(`cursor/${name}.png`)
    }

    static allLoaded(): Promise<void> {
        return new Promise(resolve => {
            if (this.loadingImages.size)
                this.doneCallback = resolve
            else
                resolve()
        })
    }

    static loadCursors() {
        [
            ['not-allowed', 'move'],
            [1, 2, 3].map(frame => ['w', 'nnw', 'nne', 'e', 'sse', 'ssw'].map(s => `attack-${s}-${frame}`)),
            [1, 2, 3].map(s => (`ranged-${s}`)),
            [1, 2, 3, 4, 5, 6].map(s => (`wait-${s}`))
        ].flat(2).forEach(s => {
            this.getCursor(s)
        });
    }
}