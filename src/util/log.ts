const hint = document.getElementById("hint") as HTMLSpanElement
const log = document.getElementById("log") as HTMLSpanElement
const logN = document.getElementById("logN") as HTMLSpanElement

const lastMessages: string[] = []

export function toGameLog(msg: string) {
    setText(msg)
}

function setText(msg: string) {
    if (log.textContent?.length) {
        lastMessages.push(log.textContent)
        if (lastMessages.length > 5) {
            lastMessages.shift()
        }
        logN.textContent = lastMessages.join(`\u00A0`.repeat(3))
    }
    log.textContent = msg
}

export function setHintText(msg: string) {
    hint.textContent = msg
}