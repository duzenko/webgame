import { GridCell, GridCellNeighbor, PathCell } from "../util/classes"
import { range } from "../util/functions"
import { setHintText, toGameLog } from "../util/log"
import { IArmiesModel } from "../web-models/armies"
import { AbstractAnimation, RangedAttackAnimation } from "./animation"
import { UnitMoveAnimation } from "./stepAnimation"
import { UnitStack } from "./unit-stack"

class Arena {
    columns = range(-9, 9)
    rows = range(-3, 3)
    stacks: UnitStack[] = []
    selectedCell?: GridCell
    selectedCellSide?: GridCellNeighbor
    animation?: AbstractAnimation

    get activeStack() {
        return this.stacks.first()
    }

    constructor() { }

    async load() {
        const response = await fetch('/data/campaign/first-farm/army.json')
        const armies = await response.json() as IArmiesModel
        for (const model of [...armies.player, ...armies.enemy]) {
            const stack = UnitStack.from(model)
            stack.onPlayerTeam = armies.player.includes(model)
            stack.xMirrored = !stack.onPlayerTeam
            this.stacks.push(stack)
        }
        this.stacks.forEach((us) => this.setDefaultPosition(us))
        this.stacks.sort((a, b) => {
            const r = b.type.speed - a.type.speed
            if (r) return r
            return a.position.y - b.position.y
        })
        this.stacks.forEach(u => u.resetActionPoints())
        toGameLog('Battle has started!')
        this.nextMove()
    }

    setDefaultPosition(stack: UnitStack) {
        const mates = this.stacks.filter((us) => this.isCellValid(us.position) && us.onPlayerTeam == stack.onPlayerTeam)
        if (!mates.length) {
            stack.position.x = stack.onPlayerTeam ? this.columns.first() : this.columns.last()
            stack.position.y = 0
            if (!this.isCellValid(stack.position)) {
                stack.position.x -= Math.sign(stack.position.x)
            }
            return
        }
        const possibleCells = mates.map(us => us.position.getNeighbors().filter(cell => {
            return this.isCellValid(cell) && !this.getStackInCell(cell)
        })).flat().sort((a, b) => a.x - b.x)
        stack.position = stack.onPlayerTeam ? possibleCells.first() : possibleCells.last()
    }

    canOccupyCell(stack: UnitStack, cell: GridCell): boolean {
        const stackInCell = this.getStackInCell(cell)
        if (!stackInCell) return true
        return stackInCell == stack
    }

    get canActiveOccupySelected() {
        return this.canOccupyCell(this.activeStack, this.selectedCell!)
    }

    nextMove() {
        if (this.activeStack.isEnemy) {
            this.makeEnemyMove()
        } else {
            setHintText(`${this.activeStack.name}'s move`)
        }
    }

    makeEnemyMove() {
        if (!this.activeStack.isAlive) {
            this.endMove()
            return
        }
        const target = this.stacks.find(u => u.onPlayerTeam && u.isAlive)
        if (!target) {
            this.endMove()
            return
        }
        const path = this.getPathForUnit(this.activeStack, target.position)
        if (!path) {
            toGameLog(`${this.activeStack.name} can't get to enemy`)
            this.endMove()
            return
        }
        let destination = target!.position
        while (this.activeStack.actionPoints < path.length + 1) {
            destination = path.pop()!
        }
        this.animation = UnitMoveAnimation.create(this.activeStack, destination)
    }

    endMove() {
        const redirect = (won: boolean) => {
            const arenaType = localStorage.getItem("arena") ?? ''
            const url = { 'campaign': '/campaign' }[arenaType] ?? '/'
            window.location.href = url + `?won=${won}`
        }
        if (!this.stacks.find(u => u.isAlive && u.onPlayerTeam)) {
            redirect(false)
            return
        }
        if (!this.stacks.find(u => u.isAlive && !u.onPlayerTeam)) {
            redirect(true)
            return
        }
        this.activeStack.resetActionPoints()
        do {
            this.stacks.push(this.stacks.shift()!)
        } while (!this.activeStack.isAlive)
        setTimeout(() => this.nextMove())
    }

    animationEnded() {
        arena.animation = undefined
        if (!arena.activeStack.actionPoints || !arena.activeStack.onPlayerTeam) {
            arena.endMove()
        }
    }

    moveActiveUnit() {
        if (this.getStackInCell(this.selectedCell!))
            this.animation = UnitMoveAnimation.create(this.activeStack, this.selectedCell!, this.selectedCellSide)
        else
            this.animation = UnitMoveAnimation.create(this.activeStack, this.selectedCell!)
    }

    getStackInCell(destination: GridCell): UnitStack | undefined {
        return this.stacks.find(u => u.isAlive && u.position.isSameAs(destination))
    }

    get selectedStack(): UnitStack | undefined {
        if (!this.selectedCell) return undefined
        return this.getStackInCell(this.selectedCell)
    }

    isCellValid(cell: GridCell): boolean {
        return cell.isValid && cell.isInRange(this.columns, this.rows)
    }

    getMovesForStack(stack: UnitStack): PathCell[] {
        const cells: PathCell[] = []
        let lastBatch = [stack.position]
        for (let i = 0; i < stack.actionPoints; i++) {
            const nextBatch: PathCell[] = []
            for (const lastCell of lastBatch) {
                const unitInCell = arena.getStackInCell(lastCell)
                if (unitInCell && unitInCell != stack) continue
                for (const nextCell of lastCell.getNeighbors()) {
                    if (!arena.isCellValid(nextCell)) continue
                    if (nextBatch.some(c => c.isSameAs(nextCell))) continue
                    if (cells.some(c => c.isSameAs(nextCell))) continue
                    nextBatch.push(new PathCell(nextCell, i + 1))
                }
            }
            cells.push(...nextBatch)
            lastBatch = nextBatch
        }
        if (stack.type.rangedAttack) {
            cells.push(...this.stacks.filter(s => s.isAlive && s != stack && !cells.some(cs => cs.isSameAs(s.position))).map(s => new PathCell(s.position, 0)))
        }
        return cells
    }

    get movesForActiveStack() {
        return this.getMovesForStack(this.activeStack)
    }

    getPathForUnit(unit: UnitStack, destination: GridCell): PathCell[] | null {
        const path: PathCell[] = []
        let currentCell = new PathCell(unit.position, 0)
        while (path.length < 33) {
            const neighbors = currentCell.getNeighbors().filter(c => (c.isSameAs(destination) || !this.getStackInCell(c)) && this.isCellValid(c) && !path.some(pc => pc.isSameAs(c)))
            if (!neighbors.length) return null
            neighbors.sort((a, b) => a.squareDistanceTo(destination) - b.squareDistanceTo(destination))
            currentCell = new PathCell(neighbors[0], path.length + 1)
            if (currentCell.isSameAs(destination)) return path
            path.push(currentCell)
        }
        return null
    }

    getPathForUnitAndSide(unit: UnitStack, destination: GridCell, side?: GridCell): PathCell[] | null {
        if (!side) return this.getPathForUnit(unit, destination)
        if (side.isSameAs(unit.position)) return []
        const path = this.getPathForUnit(unit, side)
        if (!path) return null
        return [...path, new PathCell(side, path.length + 1)]
    }

    unitCanMoveTo(unit: UnitStack, destination: GridCell): GridCell[] | false {
        if (destination.isSameAs(unit.position)) return false
        const moves = this.getMovesForStack(unit)
        if (!moves.some(c => c.isSameAs(destination))) return false
        return this.getPathForUnit(unit, destination) ?? false
    }

    async rangedAttack(stack: UnitStack) {
        const animation = this.animation = new RangedAttackAnimation(this.activeStack, stack)
        await animation.promise
        this.animation = undefined
        this.endMove()
    }
}

export const arena = new Arena()