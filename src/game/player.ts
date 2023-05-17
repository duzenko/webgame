import { GridCell, GridCellNeighbor } from "../util/classes"
import { arena } from "./arena"
import { UnitMoveAnimation } from "./complex-animation"
import { UnitStack } from "./unit-stack"

export class Player {
    static selectedCell?: GridCell
    static selectedCellSide?: GridCellNeighbor

    static get canActiveOccupySelected() {
        return arena.canOccupyCell(arena.activeStack, Player.selectedCell!)
    }

    static get selectedStack(): UnitStack | undefined {
        if (!Player.selectedCell) return undefined
        return arena.getStackInCell(Player.selectedCell)
    }

    static async moveActiveUnit() {
        if (arena.getStackInCell(Player.selectedCell!))
            arena.animation = UnitMoveAnimation.create(arena.activeStack, Player.selectedCell!, Player.selectedCellSide)
        else
            arena.animation = UnitMoveAnimation.create(arena.activeStack, Player.selectedCell!)
        arena.waitAnimation()
    }
}