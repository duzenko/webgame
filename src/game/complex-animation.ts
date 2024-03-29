import { GridCell } from "../util/classes";
import { AbstractAnimation, DamageStatsAnimation, SmoothMoveAnimation, UnitBounceAnimation } from "./animation";
import { arena } from "./arena";
import { StackDamageStats, UnitStack } from "./unit-stack";

export abstract class ComplexAnimation extends AbstractAnimation {
    constructor() {
        super()
        setTimeout(() => this.runInner())
    }

    abstract run(): Promise<void>

    private async runInner() {
        await this.run()
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
    }

    async meleeAttack(target: UnitStack) {
        this.unit.actionPoints = 0
        const stats = this.unit.attack(target)
        new DamageStatsAnimation(target, stats)
        const direction = target.position.subtract(this.unit.position)
        new UnitBounceAnimation(this.unit, direction)
        await new Promise<void>((resolve) => {
            setTimeout(async () => {
                const defenderBounce = new UnitBounceAnimation(target, direction)
                defenderBounce.scale *= 0.3
                await defenderBounce.promise
                resolve()
            }, 222)
        })
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
        const stats = this.attacker.attack(this.defender)
        new DamageStatsAnimation(this.defender, stats)
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
        animation.scale *= 0.3
        await animation.promise
    }
}

