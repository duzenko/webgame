const modal = document.getElementById("myModal") as HTMLDivElement

export function showModal() {
    modal.style.display = "block"
}

export function hideModal() {
    modal.style.display = "none"
}