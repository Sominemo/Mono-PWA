export default class APIError {
    data = 0

    type = 0

    constructor(data, { type = 0 } = {}) {
        Object.defineProperty(this, "data", {
            value: data,
            writable: false,
            configurable: true,
        })
        Object.defineProperty(this, "type", {
            value: type,
            writable: false,
            configurable: true,
        })
    }

    get info() {
        return {
            data: this.data,
            type: this.type,
        }
    }
}
