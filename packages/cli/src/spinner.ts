import ora, { Ora } from "ora"

/**
 * A utility class for managing a CLI spinner. This class encapsulates the functionality of the `ora` spinner,
 * providing methods to start and stop the spinner. It is used to give visual feedback to the user during operations
 * that have a noticeable delay, such as network requests.
 */
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
