import { GridCell } from "../util/classes";
import { lerp } from "../util/functions";
import { arena } from "./arena";
import { UnitStack } from "./unit-stack";

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
    constructor(length: number) {
        super(length)
        setTimeout(() => this.run())
    }

    abstract doStep(stepNo: number): Promise<void>

    private async run() {
        try {
            for (let frameNo = 0; frameNo < this.length; frameNo++) {
                await this.doStep(frameNo)
            }
        } finally {
            this.onFinish()
        }
    }
}

export class UnitMoveAnimation extends StepAnimation {
    destination: GridCell
    path: GridCell[]
    static readonly cellMoveTime = 300

    static create(unit: UnitStack, destination: GridCell): UnitMoveAnimation {
        const path = arena.getPathForUnit(unit, destination)!
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(private unit: UnitStack, destination: GridCell, path: GridCell[]) {
        super(path.length + 1)
        this.path = path
        this.destination = destination
    }

    async doStep(stepNo: number): Promise<void> {
        this.unit.actionPoints--
        const lastStep = stepNo == this.path.length
        if (lastStep) {
            const enemy = arena.getUnitAt(this.destination)
            if (enemy) {
                if (this.path.length) {
                    this.unit.position = this.path.last()
                }
                console.log('before attack', this.unit.position)
                await this.meleeAttack(enemy)
            } else {
                console.log('before last move', this.unit.position)
                await this.smoothMove(this.unit.position, this.destination, true)
                console.log('after last move', this.unit.position)
            }
        } else {
            console.log('before move', this.unit.position)
            await this.smoothMove(this.unit.position, this.path[stepNo], false)
            console.log('after move', this.unit.position)
        }
    }

    async meleeAttack(target: UnitStack) {
        this.unit.actionPoints = 0
        this.unit.attack(target)
        const animation = new MeleeAttackAnimation(this.unit, target)
        await animation.promise
        arena.animationEnded()
    }

    async smoothMove(from: GridCell, to: GridCell, lastStep: boolean) {
        const animation = new SmoothMoveAnimation(this.unit, from, to)
        await animation.promise
        if (lastStep) {
            arena.animationEnded()
        }
    }
}

class SmoothMoveAnimation extends VSyncAnimation {
    from: GridCell
    to: GridCell
    private resolve!: (value: void) => void
    promise = new Promise((resolve) => this.resolve = resolve)

    constructor(private unit: UnitStack, from: GridCell, to: GridCell) {
        super(UnitMoveAnimation.cellMoveTime)
        this.unit = unit
        this.from = from
        this.to = to
    }

    frame(timeElapsed: number): void {
        const alpha = timeElapsed / UnitMoveAnimation.cellMoveTime
        this.unit.position = new GridCell(lerp(this.from.x, this.to.x, alpha), lerp(this.from.y, this.to.y, alpha))
    }

    onFinish(): void {
        this.resolve()
    }
}

class MeleeAttackAnimation extends VSyncAnimation {
    savedAttacker: GridCell
    savedDefender: GridCell
    private resolve!: (value: void) => void
    promise = new Promise((resolve) => this.resolve = resolve)

    constructor(private attacker: UnitStack, private defender: UnitStack) {
        super(600)
        this.savedAttacker = attacker.position.clone()
        this.savedDefender = defender.position.clone()
    }

    frame(timeElapsed: number): void {
        const lag = 200
        const bumpLength = 0.2
        const phase1 = Math.max(0, Math.sin(timeElapsed / (this.length - lag) * Math.PI)) * bumpLength
        const phase2 = -Math.max(0, Math.sin((timeElapsed - lag) / (this.length - lag) * Math.PI)) * bumpLength
        this.attacker.position = new GridCell(lerp(this.savedAttacker.x, this.savedDefender.x, phase1), lerp(this.savedAttacker.y, this.savedDefender.y, phase1))
        this.defender.position = new GridCell(lerp(this.savedDefender.x, this.savedAttacker.x, phase2), lerp(this.savedDefender.y, this.savedAttacker.y, phase2))
    }

    onFinish(): void {
        this.resolve()
    }
}