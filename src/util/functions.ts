import { GridCell } from "./classes"

export function range(start: number, end: number) {
    return Array.apply(null, Array(end - start + 1)).map((v, i) => i + start)
}

export function lerp(a: number, b: number, alpha: number): number {
    return a + alpha * (b - a)
}