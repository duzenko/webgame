import { GridCell } from "../util/classes";
import { addTime, lerp } from "../util/functions";
import { toGameLog } from "../util/log";
import { arena } from "./arena";
import { Unit } from "./unit";

export abstract class AbstractAnimation {
    length: number // in msec

    constructor(length: number) {
        this.length = length
    }


    onFinish() { }
}

export abstract class VSyncAnimation extends AbstractAnimation {
    private static list: VSyncAnimation[] = []
    startTime = new Date()

    constructor(length: number) {
        super(length)
        VSyncAnimation.list.push(this)
    }

    abstract frame(timeElapsed: number): void

    static runAllFrames() {
        const now = new Date()
        const finished: VSyncAnimation[] = []
        for (const animation of VSyncAnimation.list) {
            const timeElapsed = now.getTime() - animation.startTime.getTime()
            if (timeElapsed < animation.length) {
                animation.frame(timeElapsed)
            } else {
                animation.frame(animation.length)
                animation.onFinish()
                finished.push(animation)
            }
        }
        VSyncAnimation.list = VSyncAnimation.list.filter(a => !finished.includes(a))
    }
}

export abstract class StepAnimation extends AbstractAnimation {
    constructor(length: number, interval: number) {
        super(length)
        if (length < 1) return
        setTimeout(() => this.firstFrame(interval))
    }

    abstract doStep(stepNo: number): void

    firstFrame(interval: number) {
        let frameNo = 0
        try {
            this.doStep(frameNo++)
        } finally {
            if (frameNo >= this.length) {
                this.onFinish()
                return
            }
        }
        const id = setInterval(() => {
            try {
                this.doStep(frameNo++)
            } finally {
                if (frameNo >= this.length) {
                    clearInterval(id)
                    this.onFinish()
                }
            }
        }, interval)
    }
}

export class UnitMoveAnimation extends StepAnimation {
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

    doStep(stepNo: number): void {
        this.unit.actionPoints--
        const lastStep = stepNo == this.path.length
        if (lastStep) {
            const enemy = arena.getUnitAt(this.destination)
            if (enemy) {
                // TODO attack animation
                enemy.isAlive = false
                this.unit.actionPoints = 0
                arena.animationEnded()
                toGameLog(`${enemy.name} eliminated!`)
            } else {
                this.smoothMove(this.unit.position, this.destination, true)
            }
        } else {
            this.smoothMove(this.unit.position, this.path[stepNo], false)
        }
    }

    smoothMove(from: GridCell, to: GridCell, lastStep: boolean) {
        new SmoothMoveAnimation(this.unit, from, to).onFinish = () => {
            if (lastStep) {
                arena.animationEnded()
            }
        }
    }
}

class SmoothMoveAnimation extends VSyncAnimation {
    unit: Unit
    from: GridCell
    to: GridCell

    constructor(unit: Unit, from: GridCell, to: GridCell) {
        super(UnitMoveAnimation.cellMoveTime)
        this.unit = unit
        this.from = from
        this.to = to
    }

    frame(timeElapsed: number): void {
        const alpha = timeElapsed / UnitMoveAnimation.cellMoveTime
        this.unit.position = new GridCell(lerp(this.from.x, this.to.x, alpha), lerp(this.from.y, this.to.y, alpha))
    }
}