import { GridCell } from "../util/classes";
import { AbstractAnimation, MeleeAttackAnimation, SmoothMoveAnimation, UnitBounceAnimation } from "./animation";
import { arena } from "./arena";
import { Projectile } from "./projectile";
import { UnitStack } from "./unit-stack";

export abstract class StepAnimation extends AbstractAnimation {
    constructor(length: number) {
        super(length)
        setTimeout(() => this.run())
    }

    abstract doStep(stepNo: number): Promise<void>

    private async run() {
        try {
            for (let frameNo = 0; frameNo < this.duration; frameNo++) {
                await this.doStep(frameNo)
            }
        } finally {
            this.onFinish()
        }
        this.resolve()
    }
}

export class UnitMoveAnimation extends StepAnimation {
    destination: GridCell
    path: GridCell[]

    static create(unit: UnitStack, destination: GridCell, selectedCellSide?: GridCell): UnitMoveAnimation {
        const path = selectedCellSide ? arena.getPathForUnitAndSide(unit, destination, selectedCellSide) : arena.getPathForUnit(unit, destination)
        return new UnitMoveAnimation(unit, destination, path!)
    }

    constructor(private unit: UnitStack, destination: GridCell, path: GridCell[]) {
        super(path.length + 1)
        this.path = path
        this.destination = destination
    }

    async doStep(stepNo: number) {
        this.unit.actionPoints--
        const lastStep = stepNo == this.path.length
        if (lastStep) {
            const enemy = arena.getStackInCell(this.destination)
            if (enemy) {
                if (this.path.length) {
                    this.unit.position = this.path.last()
                }
                await this.meleeAttack(enemy)
            } else {
                await this.smoothMove(this.destination, true)
            }
        } else {
            await this.smoothMove(this.path[stepNo], false)
        }
    }

    async meleeAttack(target: UnitStack) {
        this.unit.actionPoints = 0
        this.unit.attack(target)
        const animation = new MeleeAttackAnimation(this.unit, target)
        await animation.promise
        arena.animationEnded()
    }

    async smoothMove(to: GridCell, lastStep: boolean) {
        const animation = new SmoothMoveAnimation(this.unit, to)
        await animation.promise
        if (lastStep) {
            arena.animationEnded()
        }
    }
}

export class RangedAttackAnimation extends StepAnimation {
    position: GridCell
    direction: GridCell

    constructor(public attacker: UnitStack, public defender: UnitStack) {
        super(3)
        this.position = attacker.position.clone()
        attacker.xMirrored = defender.position.x < attacker.position.x
        this.direction = this.defender.position.subtract(this.attacker.position).normalize()
    }

    async doStep(stepNo: number) {
        switch (stepNo) {
            case 0: return await this.shoot()
            case 1: return await this.project()
            case 2: return await this.hit()
            default: throw Error('RangedAttackAnimation.doStep')
        }
    }

    async shoot() {
        const direction = this.defender.position.subtract(this.attacker.position).normalize()
        const animation = new UnitBounceAnimation(this.attacker, direction)
        await animation.promise
    }

    async project() {
        const projectile = new this.attacker.type.rangedAttack!()
        projectile.position = this.attacker.position.clone()
        arena.otherObjects.push(projectile)
        const animation = new SmoothMoveAnimation(projectile, this.defender.position)
        await animation.promise
        delete arena.otherObjects[arena.otherObjects.indexOf(projectile)]
    }

    async hit() {
        const direction = this.defender.position.subtract(this.attacker.position).normalize()
        const animation = new UnitBounceAnimation(this.defender, direction)
        await animation.promise
    }

    frame(timeElapsed: number): void {
        const p = this.attacker.position.lerp(this.defender.position, timeElapsed / this.duration)
        this.position = p.as(GridCell)
    }

    onFinish(): void {
        this.attacker.attack(this.defender)
        super.onFinish()
    }
}

