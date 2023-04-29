import { GridCell, Point } from "../util/classes";
import { lerp } from "../util/functions";
import { Projectile } from "./projectile";
import { UnitStack } from "./unit-stack";

export abstract class AbstractAnimation {
    duration: number // in msec

    constructor(length: number) {
        this.duration = length
    }

    onFinish() { }
}

export abstract class VSyncAnimation extends AbstractAnimation {
    private static list: VSyncAnimation[] = []
    startTime = new Date()
    protected resolve!: (value: void) => void
    promise = new Promise((resolve) => this.resolve = resolve)

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
            if (timeElapsed < animation.duration) {
                animation.frame(timeElapsed)
            } else {
                animation.frame(animation.duration)
                animation.onFinish()
                finished.push(animation)
            }
        }
        VSyncAnimation.list = VSyncAnimation.list.filter(a => !finished.includes(a))
    }

    onFinish(): void {
        this.resolve()
    }
}

export class SmoothMoveAnimation extends VSyncAnimation {
    from: GridCell
    to: GridCell
    static readonly cellMoveTime = 300

    constructor(private unit: UnitStack, from: GridCell, to: GridCell) {
        super(SmoothMoveAnimation.cellMoveTime)
        this.unit = unit
        this.from = from
        this.to = to
    }

    frame(timeElapsed: number): void {
        const alpha = timeElapsed / SmoothMoveAnimation.cellMoveTime
        this.unit.position = new GridCell(lerp(this.from.x, this.to.x, alpha), lerp(this.from.y, this.to.y, alpha))
    }
}

export class MeleeAttackAnimation extends VSyncAnimation {
    savedAttacker: Point
    savedDefender: Point

    constructor(private attacker: UnitStack, private defender: UnitStack) {
        super(600)
        this.savedAttacker = attacker.position.clone()
        this.savedDefender = defender.position.clone()
    }

    frame(timeElapsed: number): void {
        const lag = 200
        const bumpLength = 0.2
        const epsilon = 1e-11
        const phase1 = Math.max(0, Math.sin(timeElapsed / (this.duration - lag) * Math.PI) - epsilon) * bumpLength * 2
        const phase2 = -Math.max(0, Math.sin((timeElapsed - lag) / (this.duration - lag) * Math.PI) - epsilon) * bumpLength
        this.attacker.position.copyFrom(this.savedAttacker.lerp(this.savedDefender, phase1))
        this.defender.position.copyFrom(this.savedDefender.lerp(this.savedAttacker, phase2))
    }
}

export class RangedAttackAnimation extends VSyncAnimation {
    position: GridCell
    projectile: Projectile

    constructor(public attacker: UnitStack, public defender: UnitStack) {
        super(900)
        this.position = GridCell.from(attacker.position)
        this.projectile = new this.attacker.type.rangedAttack!()
    }

    frame(timeElapsed: number): void {
        const p = this.attacker.position.lerp(this.defender.position, timeElapsed / this.duration)
        this.position.copyFrom(p)
    }

    onFinish(): void {
        this.attacker.attack(this.defender)
        super.onFinish()
    }
}