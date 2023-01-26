import ora, { Ora } from "ora"

export default class Spinner {
    private text: string
    private ora: Ora

    constructor(text: string) {
        this.text = text
    }

    start() {
        console.info("")

        this.ora = ora({
            text: this.text,
            indent: 1
        }).start()
    }

    stop() {
        this.ora.stop()

        process.stdout.cursorTo(0)
    }
}
