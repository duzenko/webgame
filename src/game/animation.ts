import { GridCell, Point } from "../util/classes";
import { lerp } from "../util/functions";
import { ArenaObject } from "./projectile";
import { StackDamageStats, UnitStack } from "./unit-stack";

export abstract class AbstractAnimation {
    protected resolve!: (value: void) => void
    readonly promise = new Promise((resolve) => this.resolve = resolve)

    constructor() {
    }

    onFinish() { }
}

export abstract class VSyncAnimation extends AbstractAnimation {
    static list: VSyncAnimation[] = []
    startTime = new Date()
    duration: number // in msec or steps

    constructor(length: number) {
        super()
        this.duration = length
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

    constructor(public object: ArenaObject, private to: GridCell) {
        super(object.animationSpeedInverse * to.distanceTo(object.position))
        this.from = object.position.clone()
        this.to = to
        object.xMirrored = to.x < this.from.x
    }

    frame(timeElapsed: number): void {
        const alpha = timeElapsed / this.duration
        this.object.position = this.from.lerp(this.to, alpha).as(GridCell)
    }
}

export class UnitBounceAnimation extends VSyncAnimation {
    savedPosition: Point
    targetPostiopn: Point
    scale = 0.2

    constructor(private stack: UnitStack, direction: Point) {
        super(444);
        this.savedPosition = stack.position.clone()
        this.targetPostiopn = this.savedPosition.add2(direction)
    }

    frame(timeElapsed: number): void {
        const epsilon = 1e-11
        const phase = Math.max(0, Math.sin(timeElapsed / this.duration * Math.PI) - epsilon)
        this.stack.position = this.savedPosition.lerp(this.targetPostiopn, phase * this.scale * 2).as(GridCell)
    }
}

export class DamageStatsAnimation extends VSyncAnimation {
    shift = 0
    opacity = 1

    constructor(public stack: UnitStack, public stats: StackDamageStats) {
        super(3333)
    }

    frame(timeElapsed: number): void {
        this.shift = timeElapsed * 3e-2
        this.opacity = 3 - 3 * timeElapsed / this.duration
    }
}