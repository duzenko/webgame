import { GridCell } from "../util/classes";
import { Unit as UnitType } from "./unit";

export class UnitStack {
    type: UnitType
    actionPoints = 0
    position = new GridCell(NaN, NaN)
    onPlayerTeam = false

    constructor(unitType: new () => UnitType, public qty: number) {
        this.type = new unitType()
        this.qty = qty
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
}