export const log = document.getElementById("log") as HTMLSpanElement

let lastMsgTime = 0
const minMessageInterval = 1000

export function logText(msg: string) {
    const now = new Date().getTime()
    if (!lastMsgTime || lastMsgTime + minMessageInterval < now) {
        log.textContent = msg
        lastMsgTime = now
    }
    setTimeout(() => {
        log.textContent = msg
        lastMsgTime = new Date().getTime()
    }, lastMsgTime + minMessageInterval - now)
}