import fs from 'fs'

export class StateManager {
    private _filePath: string = './output/state.json'

    private _state: { [key: string]: any } = {}

    constructor() {
        if (fs.existsSync(this._filePath)) {
            const data = fs.readFileSync(this._filePath, 'utf8')
            this._state = JSON.parse(data)

            console.log(`Loaded persisted state from ${this._filePath}.`)
        } else {
            console.warn(
                `File ${this._filePath} does not exist. Starting without persisted state.`
            )
        }
    }

    getState(key: string, defaultValue: any = {}): any {
        return this._state[key] ?? defaultValue
    }

    async setState(key: string, value: any) {
        this._state[key] = value

        const dir = this._filePath.substring(0, this._filePath.lastIndexOf('/'))
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        await fs.writeFile(
            this._filePath,
            JSON.stringify(this._state, null, 4),
            'utf8',
            () => {
                console.log(
                    `State for key "${key}" has been updated and written to ${this._filePath} as JSON.`
                )
            }
        )
    }
}
