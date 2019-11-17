export default class APIError {
    data = 0

    type = 0

    constructor(data, { type = 0 } = {}) {
        this.data = data
        this.type = type
    }

    get info() {
        return {
            data: this.data,
            type: this.type,
        }
    }
}
