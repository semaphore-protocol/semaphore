import ora, { Ora } from "ora"

export default class Spinner {
    private ora: Ora

    constructor(text: string) {
        this.ora = ora({
            text,
            indent: 1
        })
    }

    start() {
        this.ora.start()
    }

    stop() {
        this.ora.stop()

        process.stdout.moveCursor(0, -1)
    }
}
