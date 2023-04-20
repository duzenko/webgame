import { GridCell } from "../util/classes"
import { range } from "../util/functions"
import { toGameLog } from "../util/log"
import { GameAnimation, UnitMoveAnimation } from "./animation"
import { Unit, testUnits } from "./unit"

class Arena {
    columns = range(-9, 9)
    rows = range(-4, 4)
    units = testUnits
    selectedCell?: GridCell
    animation?: GameAnimation
    activeUnit = this.units[0]

    constructor() {
        toGameLog('Battle has started!')
        this.nextMove()
    }

    nextMove() {
        this.activeUnit = this.units[0]
        this.activeUnit.resetActionPoints()
        if (this.activeUnit.isEnemy) {
            this.makeEnemyMove()
        } else {
            toGameLog(`${this.activeUnit.name}'s move`)
        }
    }

    makeEnemyMove() {
        if (!this.activeUnit.isAlive) {
            this.endMove()
            return
        }
        const target = this.units.find(u => !u.isEnemy && u.isAlive)
        if (!target) {
            this.endMove()
            return
        }
        const path = this.activeUnit.position.pathTo(target!.position)
        let destination = target!.position
        toGameLog(this.activeUnit.name + ' targets ' + target?.name)
        while (this.activeUnit.actionPoints < path.length + 1) {
            destination = path.pop()!
        }
        this.animation = UnitMoveAnimation.create(this.activeUnit, destination)
    }

    endMove() {
        if (!this.units.find(u => u.isAlive && !u.isEnemy)) {
            setTimeout(() => {
                alert('You lost! Game will restart now')
                window.location.reload()
            }, 99);
            return
        }
        if (!this.units.find(u => u.isAlive && u.isEnemy)) {
            setTimeout(() => {
                alert('You won! Game will restart now')
                window.location.reload()
            }, 99);
            return
        }
        do {
            this.units.push(this.units.shift()!)
        } while (!this.units[0].isAlive)
        setTimeout(() => this.nextMove())
    }

    animationEnded() {
        arena.animation = undefined
        arena.selectedCell = undefined
        if (!arena.activeUnit.actionPoints || arena.activeUnit.isEnemy) {
            arena.endMove()
        }
    }

    moveUnit(unit: Unit, destination: GridCell) {
        this.animation = UnitMoveAnimation.create(unit, destination)
    }

    getUnitAt(destination: GridCell) {
        return this.units.find(u => u.isAlive && u.position.isSameAs(destination))
    }

    isCellValid(cell: GridCell): boolean {
        return cell.isValid && cell.isInRange(this.columns, this.rows)
    }

    getMovesForUnit(unit: Unit): GridCell[] {
        const cells = [unit.position]
        let lastBatch = cells
        for (let i = 0; i < unit.actionPoints; i++) {
            const nextBatch: GridCell[] = []
            for (const lastCell of lastBatch) {
                const unitInCell = arena.getUnitAt(lastCell)
                if (unitInCell && unitInCell != unit) continue
                for (const nextCell of lastCell.getNeighbors()) {
                    if (!arena.isCellValid(nextCell)) continue
                    if (nextBatch.some(c => c.isSameAs(nextCell))) continue
                    if (cells.some(c => c.isSameAs(nextCell))) continue
                    nextBatch.push(nextCell)
                }
            }
            cells.push(...nextBatch)
            lastBatch = nextBatch
        }
        return cells
    }


    getPathForUnit(unit: Unit, destination: GridCell): GridCell[] {
        return unit.position.pathTo(destination)
    }

    unitCanMoveTo(unit: Unit, destination: GridCell): GridCell[] | null {
        const moves = this.getMovesForUnit(unit)
        if (!moves.some(c => c.isSameAs(destination))) return null
        return this.getPathForUnit(unit, destination)
    }

}



export const arena = new Arena()