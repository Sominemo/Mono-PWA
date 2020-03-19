export default class Cashback {
    constructor(amount, type) {
        if (Number.isNaN(amount)) throw new TypeError("Incorrect amount")
        if (typeof type !== "string") throw new TypeError("Incorrect type")
        this.amount = amount
        this.type = type
    }

    get object() {
        return this.amount
    }

    get string() {
        return `🎁 ${this.amount}`
    }
}
