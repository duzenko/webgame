const log = document.getElementById("log") as HTMLSpanElement
const logN = document.getElementById("logN") as HTMLSpanElement

let lastMsgTime = 0
const minMessageInterval = 1000
const lastMessages: string[] = []

export function logText(msg: string) {
    const now = new Date().getTime()
    if (!lastMsgTime || lastMsgTime + minMessageInterval < now) {
        lastMsgTime = now
        setText(msg)
    } else {
        lastMsgTime = lastMsgTime + minMessageInterval
        setTimeout(() => setText(msg), lastMsgTime + minMessageInterval - now)
    }
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
    log.style.color = 'yellow'
    // log.style.fontSize = '1.5em'
    setTimeout(() => {
        log.style.color = 'white'
        // log.style.fontSize = '1.2em'
    }, 100)
}