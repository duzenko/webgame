const modal = document.getElementById("myModal") as HTMLDivElement
const modalText = document.getElementById("modalText") as HTMLParagraphElement
const modalClose = document.getElementById("modalClose") as HTMLSpanElement
let promiseResolve: ((value: unknown) => void) | undefined

export function showModal(message: string) {
    promiseResolve = undefined
    modal.style.display = "block"
    modalText.textContent = message
}

export function hideModal() {
    modal.style.display = "none"
    modalClose.style.display = 'none'
}

export async function showModalOk(message: string) {
    modalClose.style.display = 'block'
    showModal(message)
    await new Promise(r => promiseResolve = r)
}

modalClose.onclick = function () {
    hideModal()
    promiseResolve?.call(undefined, undefined)
}