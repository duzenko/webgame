import { GridCell } from "../util/classes";
import { toGameLog } from "../util/log";
import { IStackModel } from "../web-models/armies";
import { Unit, knownUnits } from "./units/unit";
import "./units/humans"
import { ArenaObject } from "./projectile";

export class StackDamageStats {
    constructor(public damage: number, public killed: number) { }
}

export class UnitStack extends ArenaObject {
    type: Unit
    actionPoints = 0
    onPlayerTeam = false
    health: number

    static from(stack: IStackModel): UnitStack {
        const unitType = knownUnits[stack.unit]
        return new UnitStack(unitType, stack.qty ?? 1)
    }

    constructor(unitType: new () => Unit, public qty: number = 1) {
        super()
        this.type = new unitType()
        this.qty = qty
        this.health = this.type.health
    }

    moveTo(cell: GridCell) {
        this.position = cell
    }

    resetActionPoints() {
        this.actionPoints = this.type.speed
    }

    get isAlive() {
        return this.qty > 0
    }

    get name() {
        return this.qty > 1 ? this.type.plural : this.type.name
    }

    attack(enemy: UnitStack): StackDamageStats {
        this.actionPoints = 0
        let damageModifier = 1
        damageModifier += (this.type.attack - enemy.type.defence) * 0.05
        // if (this.onPlayerTeam) damageModifier += 10
        const damage = Math.round(this.type.damage * this.qty * damageModifier)
        toGameLog(`${this.name} ${this.qty > 1 ? 'deal' : 'deals'} ${damage} damage to ${enemy.name}`)
        return enemy.receiveDamage(damage)
    }

    receiveDamage(damage: number): StackDamageStats {
        if (damage < this.health) {
            this.health -= damage
            return new StackDamageStats(damage, 0)
        } else {
            const totalHealth = (this.qty - 1) * this.type.health + this.health - damage
            let killed = this.qty
            if (totalHealth > 0) {
                this.qty = Math.ceil(totalHealth / this.type.health)
                killed -= this.qty
                this.health = (totalHealth - 1) % this.type.health + 1
                toGameLog(`${this.name}s killed: ${killed}`)
            } else {
                this.qty = 0
                toGameLog(`${this.name}s killed: ${killed}. The troop is killed.`)
            }
            return new StackDamageStats(damage, killed)
        }
    }
}