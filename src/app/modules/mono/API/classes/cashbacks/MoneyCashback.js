import Cashback from "../Cashback"
import Currency from "../Currency"
import Money from "../Money"

export default class MoneyCashback extends Cashback {
    constructor(amount, currency) {
        if (!(currency instanceof Currency)) throw new TypeError("Incorrect currency")
        const type = currency.code

        super(amount, type)
        this.currency = currency
    }

    get object() {
        return Money.integer(Math.abs(this.amount), this.currency)
    }

    get sign() {
        return Math.sign(this.amount)
    }
}
