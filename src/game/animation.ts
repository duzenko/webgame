import { GridCell, Point } from "../util/classes";
import { lerp } from "../util/functions";
import { ArenaObject } from "./projectile";
import { UnitStack } from "./unit-stack";

export abstract class AbstractAnimation {
    duration: number // in msec or steps
    protected resolve!: (value: void) => void
    readonly promise = new Promise((resolve) => this.resolve = resolve)

    constructor(length: number) {
        this.duration = length
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

    constructor(private object: ArenaObject, private to: GridCell) {
        super(144 * to.distanceTo(object.position))
        this.from = object.position.clone()
        this.to = to
        object.xMirrored = to.x < this.from.x
    }

    frame(timeElapsed: number): void {
        const alpha = timeElapsed / this.duration
        this.object.position = this.from.lerp(this.to, alpha).as(GridCell)
    }
}

export class MeleeAttackAnimation extends VSyncAnimation {
    savedAttacker: Point
    savedDefender: Point

    constructor(private attacker: UnitStack, private defender: UnitStack) {
        super(600)
        this.savedAttacker = attacker.position.clone()
        this.savedDefender = defender.position.clone()
        attacker.xMirrored = defender.position.x < attacker.position.x
    }

    frame(timeElapsed: number): void {
        const lag = 200
        const bumpLength = 0.2
        const epsilon = 1e-11
        const phase1 = Math.max(0, Math.sin(timeElapsed / (this.duration - lag) * Math.PI) - epsilon) * bumpLength * 2
        const phase2 = -Math.max(0, Math.sin((timeElapsed - lag) / (this.duration - lag) * Math.PI) - epsilon) * bumpLength
        this.attacker.position = this.savedAttacker.lerp(this.savedDefender, phase1).as(GridCell)
        this.defender.position = this.savedDefender.lerp(this.savedAttacker, phase2).as(GridCell)
    }
}

export class UnitBounceAnimation extends VSyncAnimation {
    savedPosition: Point
    targetPostiopn: Point

    constructor(private stack: UnitStack, direction: Point) {
        super(444);
        this.savedPosition = stack.position.clone()
        this.targetPostiopn = this.savedPosition.add2(direction)
    }

    frame(timeElapsed: number): void {
        const bumpLength = 0.2
        const epsilon = 1e-11
        const phase = Math.max(0, Math.sin(timeElapsed / this.duration * Math.PI) - epsilon)
        this.stack.position = this.savedPosition.lerp(this.targetPostiopn, phase * bumpLength * 2).as(GridCell)
    }
}