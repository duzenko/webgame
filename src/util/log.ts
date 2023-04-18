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
    // log.style.color = 'yellow'
    // log.style.fontSize = '1.5em'
    setTimeout(() => {
        // log.style.color = 'white'
        // log.style.fontSize = '1.2em'
    }, 100)
}