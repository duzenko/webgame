import { Unit } from "./unit";

const loadingImages = new Map(), loadedImages = new Map()

export function getImageForUnit(unit: Unit): ImageBitmap | undefined {
    const imageName = unit.imageName
    if (loadedImages.has(imageName)) return loadedImages.get(imageName)
    if (loadingImages.has(imageName)) return undefined
    const image = new Image()
    image.src = './img/unit/' + imageName
    image.onload = () => {
        loadingImages.delete(imageName)
        loadedImages.set(imageName, image)
    }
    loadingImages.set(imageName, image)
    return undefined
}