const log = document.getElementById("log") as HTMLSpanElement

let lastMsgTime = 0
const minMessageInterval = 2000

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
    log.textContent = msg
    log.style.color = 'yellow'
    log.style.fontSize = '1.5em'
    setTimeout(() => {
        log.style.color = 'white'
        log.style.fontSize = '1.2em'
    }, 333)
}