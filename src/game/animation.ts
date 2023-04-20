import { GridCell } from "../util/classes";
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
    abstract ended(): void
}

export class UnitMoveAnimation extends GameAnimation {
    unit: Unit
    destination: GridCell
    path: GridCell[]

    static create(unit: Unit, destination: GridCell): UnitMoveAnimation {
        const path = arena.getPathForUnit(unit, destination)!
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(unit: Unit, destination: GridCell, path: GridCell[]) {
        super(path.length + 1, 333)
        this.path = path
        this.unit = unit
        this.destination = destination
    }

    frame(frameNo: number): void {
        this.unit.actionPoints--
        if (frameNo < this.path.length) {
            this.unit.moveTo(this.path[frameNo])
        } else {
            const enemy = arena.getUnitAt(this.destination)
            if (enemy) {
                enemy.isAlive = false
                this.unit.actionPoints = 0
                toGameLog(`${enemy.name} eliminated!`)
            } else {
                this.unit.moveTo(this.destination)
            }
        }
    }

    ended(): void {
        arena.animationEnded()
    }

}