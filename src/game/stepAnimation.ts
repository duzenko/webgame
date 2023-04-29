import { GridCell } from "../util/classes";
import { AbstractAnimation, MeleeAttackAnimation, SmoothMoveAnimation } from "./animation";
import { arena } from "./arena";
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

    async doStep(stepNo: number): Promise<void> {
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
                await this.smoothMove(this.unit.position, this.destination, true)
            }
        } else {
            await this.smoothMove(this.unit.position, this.path[stepNo], false)
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
