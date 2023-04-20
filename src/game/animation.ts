import { GridCell } from "../util/classes";
import { lerp } from "../util/functions";
import { toGameLog } from "../util/log";
import { arena } from "./arena";
import { Unit } from "./unit";

export abstract class GameAnimation {

    constructor(length: number, interval: number) {
        let frameNo = 0;
        const id = setInterval(() => {
            try {
                this.frame(frameNo)
            } finally {
                if (++frameNo >= length) {
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

    static readonly cellTime = 300
    static readonly smoothFrames = 30

    static create(unit: Unit, destination: GridCell): UnitMoveAnimation {
        const path = arena.getPathForUnit(unit, destination)!
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(unit: Unit, destination: GridCell, path: GridCell[]) {
        super(path.length + 1, UnitMoveAnimation.cellTime)
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
        const unit = this.unit
        new class extends GameAnimation {
            frame(frameNo: number): void {
                const alpha = (frameNo + 1) / UnitMoveAnimation.smoothFrames
                unit.position = new GridCell(lerp(from.x, to.x, alpha), lerp(from.y, to.y, alpha))
            }
            ended(): void {
            }
        }(UnitMoveAnimation.smoothFrames, UnitMoveAnimation.cellTime / UnitMoveAnimation.smoothFrames);
    }

    ended(): void {
        arena.animationEnded()
    }

}