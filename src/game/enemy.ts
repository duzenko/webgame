import { toGameLog } from "../util/log"
import { AbstractAnimation } from "./animation"
import { arena } from "./arena"
import { RangedAttackAnimation, UnitMoveAnimation } from "./complex-animation"

export class Enemy {
    static turn(): AbstractAnimation | undefined {
        const activeStack = arena.activeStack
        if (!activeStack.isAlive) {
            return
        }
        const target = arena.stacks.find(u => u.onPlayerTeam && u.isAlive)
        if (!target) {
            return
        }
        if (activeStack.type.rangedAttack) {
            return new RangedAttackAnimation(activeStack, target)
        }
        const path = arena.getPathForUnit(activeStack, target.position)
        if (!path) {
            toGameLog(`${arena.activeStack.name} can't get to enemy`)
            return
        }
        let destination = target!.position
        while (arena.activeStack.actionPoints < path.length + 1) {
            destination = path.pop()!
        }
        return UnitMoveAnimation.create(arena.activeStack, destination)
    }
}