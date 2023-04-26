import { GridCell } from "../util/classes";
import { toGameLog } from "../util/log";
import { Unit as UnitType } from "./unit";

export class UnitStack {

    type: UnitType
    actionPoints = 0
    position = new GridCell(NaN, NaN)
    onPlayerTeam = false
    health: number

    constructor(unitType: new () => UnitType, public qty: number = 1) {
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

    /**
     * @deprecated use onPlayerTeam instead
     */
    get isEnemy() {
        return !this.onPlayerTeam
    }

    get name() {
        return this.type.name
    }

    attack(enemy: UnitStack) {
        this.actionPoints = 0
        const damage = this.type.damage * this.qty
        toGameLog(`${this.name} deals ${damage} damage to ${enemy.name}`)
        enemy.receiveDamage(damage)
    }

    receiveDamage(damage: number) {
        if (damage < this.health) {
            this.health -= damage
        } else {
            const totalHealth = (this.qty - 1) * this.type.health + this.health - damage
            if (totalHealth > 0) {
                this.qty = Math.ceil(totalHealth / this.type.health)
                this.health = (totalHealth + 1) % this.type.health - 1
            } else {
                this.qty = 0
                toGameLog(`${this.name} eliminated`)
            }
        }

    }
}