import { GridCell } from "./classes"

function range(start: number, end: number) {
    return Array.apply(null, Array(end - start + 1)).map((v, i) => i + start)
}

export const objects: {
    start: GridCell
    endCell?: GridCell
    columns: number[]
    rows: number[]
} = {
    start: new GridCell(-8, 0),
    columns: range(-9, 9),
    rows: range(-3, 3)
}