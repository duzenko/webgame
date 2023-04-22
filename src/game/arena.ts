import { GridCell } from "../util/classes"
import { range } from "../util/functions"
import { toGameLog } from "../util/log"
import { AbstractAnimation, UnitMoveAnimation } from "./animation"
import { Unit, arenaStacks } from "./unit"
import { UnitStack } from "./unit-stack"

class Arena {
    columns = range(-9, 9)
    rows = range(-4, 4)
    stacks = arenaStacks
    selectedCell?: GridCell
    animation?: AbstractAnimation

    get activeUnit() {
        return this.stacks.first()
    }

    constructor() {
        toGameLog('Battle has started!')
        arenaStacks.forEach((us) => this.setDefaultPosition(us))
        setTimeout(() => this.nextMove())
        this.stacks.forEach(u => u.resetActionPoints())
    }

    setDefaultPosition(stack: UnitStack) {
        const mates = arenaStacks.filter((us) => this.isCellValid(us.position) && us.onPlayerTeam == stack.onPlayerTeam)
        if (!mates.length) {
            stack.position.x = stack.onPlayerTeam ? this.columns.first() : this.columns.last()
            stack.position.y = 0
            if (!this.isCellValid(stack.position)) {
                stack.position.x -= Math.sign(stack.position.x)
            }
            return
        }
        const possibleCells = mates.map(us => us.position.getNeighbors().filter(cell => {
            return this.isCellValid(cell) && !this.getUnitAt(cell)
        })).flat().sort((a, b) => a.x - b.x)
        stack.position = stack.onPlayerTeam ? possibleCells.first() : possibleCells.last()
    }

    nextMove() {
        if (this.activeUnit.isEnemy) {
            this.makeEnemyMove()
        } else {
            toGameLog(`${this.activeUnit.type.name}'s move`)
        }
    }

    makeEnemyMove() {
        if (!this.activeUnit.isAlive) {
            this.endMove()
            return
        }
        const target = this.stacks.find(u => !u.isEnemy && u.isAlive)
        if (!target) {
            this.endMove()
            return
        }
        const path = this.getPathForUnit(this.activeUnit, target.position)
        if (!path) {
            this.endMove()
            return
        }
        let destination = target!.position
        toGameLog(this.activeUnit.type.name + ' targets ' + target.type.name)
        while (this.activeUnit.actionPoints < path.length + 1) {
            destination = path.pop()!
        }
        this.animation = UnitMoveAnimation.create(this.activeUnit, destination)
    }

    endMove() {
        if (!this.stacks.find(u => u.isAlive && !u.isEnemy)) {
            setTimeout(() => {
                alert('You lost! Game will restart now')
                window.location.reload()
            }, 99);
            return
        }
        if (!this.stacks.find(u => u.isAlive && u.isEnemy)) {
            setTimeout(() => {
                alert('You won! Game will restart now')
                window.location.reload()
            }, 99);
            return
        }
        this.activeUnit.resetActionPoints()
        do {
            this.stacks.push(this.stacks.shift()!)
        } while (!this.activeUnit.isAlive)
        setTimeout(() => this.nextMove())
    }

    animationEnded() {
        arena.animation = undefined
        if (!arena.activeUnit.actionPoints || arena.activeUnit.isEnemy) {
            arena.endMove()
        }
    }

    moveUnit(unit: UnitStack, destination: GridCell) {
        this.animation = UnitMoveAnimation.create(unit, destination)
    }

    getUnitAt(destination: GridCell) {
        return this.stacks.find(u => u.isAlive && u.position.isSameAs(destination))
    }

    isCellValid(cell: GridCell): boolean {
        return cell.isValid && cell.isInRange(this.columns, this.rows)
    }

    getMovesForUnit(unit: UnitStack): GridCell[] {
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


    getPathForUnit(unit: UnitStack, destination: GridCell): GridCell[] | null {
        const path: GridCell[] = []
        let nextCell = new GridCell(unit.position.x, unit.position.y)
        while (path.length < 33) {
            const neighbors = nextCell.getNeighbors().filter(c => c.isSameAs(destination) || !this.getUnitAt(c))
            if (!neighbors.length) return null
            neighbors.sort((a, b) => a.squareDistanceTo(destination) - b.squareDistanceTo(destination))
            nextCell = neighbors[0]
            if (nextCell.isSameAs(destination)) return path
            path.push(nextCell)
        }
        return null
    }

    unitCanMoveTo(unit: UnitStack, destination: GridCell): GridCell[] | false {
        if (destination.isSameAs(unit.position)) return false
        const moves = this.getMovesForUnit(unit)
        if (!moves.some(c => c.isSameAs(destination))) return false
        return this.getPathForUnit(unit, destination) ?? false
    }

}

export const arena = new Arena()