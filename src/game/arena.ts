import { GridCell, PathCell } from "../util/classes"
import { range } from "../util/functions"
import { setHintText, toGameLog } from "../util/log"
import { showModalOk } from "../util/modal"
import { IArmiesModel } from "../web-models/armies"
import { getCurrentMission, isInCampaign, processCampaignGame } from "../util/campaign"
import { AbstractAnimation } from "./animation"
import { RangedAttackAnimation, UnitMoveAnimation } from "./complex-animation"
import { UnitStack } from "./unit-stack"
import { Enemy } from "./enemy"

class Arena {
    columns = range(-9, 9)
    rows = range(-3, 3)
    stacks: UnitStack[] = []
    animation?: AbstractAnimation

    get activeStack() {
        return this.stacks.first()
    }

    constructor() { }

    async load() {
        if (isInCampaign()) {
            const mission = await getCurrentMission()
            var response = await fetch(`/data/campaign/${mission.name}/army.json`)
        } else {
            var response = await fetch('/data/quick/army.json')
        }
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
    }

    start() {
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
            return this.isCellValid(cell) && !this.getStackInCell(cell) && !this.isCellValid(cell.getNeighbor(stack.onPlayerTeam ? 3 : 0))
        })).flat().sort((a, b) => Math.abs(a.y) - Math.abs(b.y))
        stack.position = possibleCells.first()
    }

    canOccupyCell(stack: UnitStack, cell: GridCell): boolean {
        const stackInCell = this.getStackInCell(cell)
        if (!stackInCell) return true
        return stackInCell == stack
    }

    private nextMove() {
        if (this.activeStack.onPlayerTeam) {
            setHintText(`${this.activeStack.name}'s move`)
        } else {
            this.animation = Enemy.turn()
            this.waitAnimation()
        }
    }

    async waitAnimation() {
        if (this.animation)
            await this.animation.promise
        this.animation = undefined
        if (!arena.activeStack.actionPoints || !arena.activeStack.onPlayerTeam) {
            this.endMove()
        }
    }

    endMove() {
        const redirect = async (won: boolean) => {
            await showModalOk(won ? 'You won!' : 'You lost!')
            if (isInCampaign()) {
                processCampaignGame(won)
            } else
                window.location.href = '/'
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

    getStackInCell(destination: GridCell): UnitStack | undefined {
        return this.stacks.find(u => u.isAlive && u.position.isSameAs(destination))
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
        this.animation = new RangedAttackAnimation(this.activeStack, stack)
        this.waitAnimation()
    }
}

export const arena = new Arena()