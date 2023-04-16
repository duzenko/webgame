import { GameAnimation } from "./animation"
import { GridCell } from "./classes"
import { logText } from "./log"

function range(start: number, end: number) {
    return Array.apply(null, Array(end - start + 1)).map((v, i) => i + start)
}

export abstract class Unit {
    position: GridCell
    isAlive = true
    isEnemy = false
    speed = 2
    actionPoints = 0
    image = new Image()

    constructor(position: GridCell) {
        this.position = position
        this.image.src = './img/unit/' + this.getImageName()
    }

    moveTo(cell: GridCell) {
        this.position = cell
    }

    resetActionPoints() {
        this.actionPoints = this.speed
    }

    abstract getImageName(): string;

    get name() {
        return this.constructor.name
    }
}

class Peasant extends Unit {
    getImageName(): string {
        return 'peasant.png'
    }
}


class Wolf extends Unit {
    isEnemy = true
    speed = 3

    getImageName(): string {
        return 'wolf.png'
    }
}

class Arena {
    columns = range(-9, 9)
    rows = range(-3, 3)
    units = [new Wolf(new GridCell(8, 0)), new Peasant(new GridCell(-8, 0))]
    selectedCell?: GridCell
    animation?: GameAnimation
    activeUnit = this.units[0]

    constructor() {
        logText('Battle has started!')
        this.nextMove()
    }

    nextMove() {
        this.activeUnit = this.units[0]
        this.activeUnit.resetActionPoints()
        if (this.activeUnit.isEnemy) {
            this.makeEnemyMove()
        } else {
            logText(`It's ${this.activeUnit.name}'s move`)
        }
    }

    makeEnemyMove() {
        if (!this.activeUnit.isAlive) {
            this.endMove()
        }
        const target = this.units.find(u => !u.isEnemy && u.isAlive)
        if (!target) {
            this.endMove()
        }
        const path = this.activeUnit.position.pathTo(target!.position)
        let destination = target!.position
        logText(this.activeUnit.name + ' targets ' + target?.name)
        while (this.activeUnit.actionPoints < path.length + 1) {
            destination = path.pop()!
        }
        this.animation = UnitMoveAnimation.create(this.activeUnit, destination)
    }

    endMove() {
        this.units.push(this.units.shift()!)
        this.nextMove()
    }

    moveUnit(unit: Unit, destination: GridCell) {
        this.animation = UnitMoveAnimation.create(unit, destination)
    }

    getUnitAt(destination: GridCell) {
        return this.units.find(u => u.isAlive && u.position.isSameAs(destination))
    }
}

class UnitMoveAnimation extends GameAnimation {
    unit: Unit
    destination: GridCell
    path: GridCell[]

    static create(unit: Unit, destination: GridCell): UnitMoveAnimation {
        const path = unit.position.pathTo(destination)
        return new UnitMoveAnimation(unit, destination, path)
    }

    constructor(unit: Unit, destination: GridCell, path: GridCell[]) {
        super(path.length + 1, 333)
        this.path = path
        this.unit = unit
        this.destination = destination
    }

    frame(frameNo: number): void {
        if (frameNo < this.path.length) {
            this.unit.moveTo(this.path[frameNo])
        } else {
            const enemy = arena.getUnitAt(this.destination)
            if (enemy) {
                enemy.isAlive = false
            } else {
                this.unit.moveTo(this.destination)
            }
        }
    }

    ended(): void {
        arena.animation = undefined
        arena.selectedCell = undefined
        arena.endMove()
    }

}

export const arena = new Arena()