import { GridCell } from "../util/classes";
import { lerp } from "../util/functions";
import { toGameLog } from "../util/log";
import { arena } from "./arena";
import { Unit } from "./unit";

export abstract class GameAnimation {

    constructor(length: number, interval: number) {
        if (length < 1) return
        setTimeout(() => this.firstFrame(length, interval))
    }

    private firstFrame(length: number, interval: number) {
        let frameNo = 0
        try {
            this.frame(frameNo++)
        } finally {
            if (frameNo >= length) {
                this.ended()
                return
            }
        }
        const id = setInterval(() => {
            try {
                this.frame(frameNo++)
            } finally {
                if (frameNo >= length) {
                    clearInterval(id)
                    this.ended()
                }
            }
        }, interval)
    }

    abstract frame(frameNo: number): void

    ended() { }
}

export class UnitMoveAnimation extends GameAnimation {
    unit: Unit
    destination: GridCell
    path: GridCell[]
    static readonly cellMoveTime = 300

    static create(unit: Unit, destination: GridCell): UnitMoveAnimation {
        const path = arena.getPathForUnit(unit, destination)!
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(unit: Unit, destination: GridCell, path: GridCell[]) {
        super(path.length + 1, UnitMoveAnimation.cellMoveTime)
        this.path = path
        this.unit = unit
        this.destination = destination
    }

    frame(frameNo: number): void {
        this.unit.actionPoints--
        if (frameNo < this.path.length) {
            // this.unit.moveTo(this.path[frameNo])
            this.smoothMove(this.unit.position, this.path[frameNo])
        } else {
            const enemy = arena.getUnitAt(this.destination)
            if (enemy) {
                enemy.isAlive = false
                this.unit.actionPoints = 0
                toGameLog(`${enemy.name} eliminated!`)
            } else {
                // this.unit.moveTo(this.destination)
                this.smoothMove(this.unit.position, this.destination)
            }
        }
    }

    smoothMove(from: GridCell, to: GridCell) {
        new SmoothMoveAnimation(this.unit, from, to)
    }

    ended(): void {
        arena.animationEnded()
    }

}

class SmoothMoveAnimation extends GameAnimation {
    static readonly smoothFrames = 30

    unit: Unit
    from: GridCell
    to: GridCell

    constructor(unit: Unit, from: GridCell, to: GridCell) {
        super(SmoothMoveAnimation.smoothFrames, UnitMoveAnimation.cellMoveTime / SmoothMoveAnimation.smoothFrames)
        this.unit = unit
        this.from = from
        this.to = to
    }

    frame(frameNo: number): void {
        const alpha = (frameNo + 1) / SmoothMoveAnimation.smoothFrames
        this.unit.position = new GridCell(lerp(this.from.x, this.to.x, alpha), lerp(this.from.y, this.to.y, alpha))
    }
}