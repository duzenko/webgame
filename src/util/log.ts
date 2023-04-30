const hint = document.getElementById("hint") as HTMLSpanElement
const log = document.getElementById("log") as HTMLSpanElement
const logN = document.getElementById("logN") as HTMLSpanElement

const lastMessages: string[] = []

export function toGameLog(msg: string) {
    setText(msg)
}

function setText(msg: string) {
    lastMessages.push(msg)
    if (lastMessages.length > 5) {
        lastMessages.shift()
    }
    logN.textContent = lastMessages.join(`\u00A0`.repeat(3))
}

export function setHintText(msg: string) {
    log.textContent = msg
}