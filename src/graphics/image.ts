import { Unit } from "../game/unit";

const loadingImages = new Map(), loadedImages = new Map()

export function getImageByName(imageName: string): ImageBitmap | undefined {
    if (loadedImages.has(imageName)) return loadedImages.get(imageName)
    if (loadingImages.has(imageName)) return undefined
    const image = new Image()
    image.src = './img/' + imageName
    image.onload = () => {
        loadingImages.delete(imageName)
        loadedImages.set(imageName, image)
    }
    loadingImages.set(imageName, image)
    return undefined
}

export function getImageForUnit(unit: Unit): ImageBitmap | undefined {
    return getImageByName('unit/' + unit.imageName)
}