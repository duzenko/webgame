export abstract class GameAnimation {
    private length: number
    private interval: number

    constructor(length: number, interval: number) {
        this.length = length
        this.interval = interval
        let frameNo = 0;
        const id = setInterval(() => {
            try {
                this.frame(frameNo)
            } finally {
                if (++frameNo >= length) {
                    clearInterval(id)
                    this.ended()
                }
            }
        }, interval)
    }

    abstract frame(frameNo: number): void
    abstract ended(): void
}