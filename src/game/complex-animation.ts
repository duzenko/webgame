import { GridCell } from "../util/classes";
import { AbstractAnimation, MeleeAttackAnimation, SmoothMoveAnimation, UnitBounceAnimation } from "./animation";
import { arena } from "./arena";
import { UnitStack } from "./unit-stack";

export abstract class ComplexAnimation extends AbstractAnimation {
    constructor() {
        super()
        setTimeout(() => this.runInner())
    }

    abstract run(): Promise<void>

    private async runInner() {
        try {
            await this.run()
        } finally {
            this.onFinish()
        }
        this.resolve()
    }
}

export class UnitMoveAnimation extends ComplexAnimation {
    destination: GridCell

    static create(unit: UnitStack, destination: GridCell, selectedCellSide?: GridCell): UnitMoveAnimation {
        const path = selectedCellSide ? arena.getPathForUnitAndSide(unit, destination, selectedCellSide) : arena.getPathForUnit(unit, destination)
        return new UnitMoveAnimation(unit, destination, path!)
    }

    constructor(private unit: UnitStack, destination: GridCell, private path: GridCell[]) {
        super()
        this.destination = destination
    }

    async run() {
        for (const step of this.path) {
            this.unit.actionPoints--
            await this.smoothMove(step)
        }
        const enemy = arena.getStackInCell(this.destination)
        this.unit.actionPoints--
        if (enemy) {
            if (this.path.length) {
                this.unit.position = this.path.last()
            }
            await this.meleeAttack(enemy)
        } else
            await this.smoothMove(this.destination)
        arena.animationEnded()
    }

    async meleeAttack(target: UnitStack) {
        this.unit.actionPoints = 0
        this.unit.attack(target)
        const animation = new MeleeAttackAnimation(this.unit, target)
        await animation.promise
    }

    async smoothMove(to: GridCell) {
        const animation = new SmoothMoveAnimation(this.unit, to)
        await animation.promise
    }
}

export class RangedAttackAnimation extends ComplexAnimation {
    position: GridCell
    direction: GridCell

    constructor(public attacker: UnitStack, public defender: UnitStack) {
        super()
        this.position = attacker.position.clone()
        attacker.xMirrored = defender.position.x < attacker.position.x
        this.direction = this.defender.position.subtract(this.attacker.position).normalize()
    }

    async run() {
        await this.shoot()
        await this.project()
        this.attacker.attack(this.defender)
        await this.hit()
    }

    async shoot() {
        const direction = this.defender.position.subtract(this.attacker.position).normalize()
        const animation = new UnitBounceAnimation(this.attacker, direction)
        await animation.promise
    }

    async project() {
        const projectile = new this.attacker.type.rangedAttack!()
        projectile.position = this.attacker.position.clone()
        const animation = new SmoothMoveAnimation(projectile, this.defender.position)
        await animation.promise
    }

    async hit() {
        const direction = this.defender.position.subtract(this.attacker.position).normalize()
        const animation = new UnitBounceAnimation(this.defender, direction)
        await animation.promise
    }
}

