import { Currency } from "./Currency"

export default class Money {
    constructor(integer, decimal, currency) {
        if (!Number.isInteger(integer) || integer < 0) throw new TypeError("Wrong integer")
        if (!Number.isInteger(decimal) || decimal < 0) throw new TypeError("Wrong decimal")
        if (!(currency instanceof Currency)) throw new TypeError("Currency constructor expected")

        this.integer = integer
        this.decimal = decimal
        this.currency = currency
    }

    get float() {
        return this.number / (10 ** this.currency.digits)
    }

    get number() {
        return this.integer * (10 ** this.currency.digits) + this.decimal
    }

    get string() {
        return this.float.toFixed(this.currency.digits)
    }

    get isZero() {
        return (this.integer === 0 && this.decimal === 0)
    }

    static integer(expression, currency) {
        if (!Number.isInteger(expression) || expression < 0) throw new TypeError("Wrong expression")
        if (!(currency instanceof Currency)) throw new TypeError("Currency constructor expected")

        const integer = Math.floor(expression / (10 ** currency.digits))
        const decimal = Math.floor(expression % (10 ** currency.digits))

        return new Money(integer, decimal, currency)
    }

    static float(float, currency) {
        if (typeof float !== "number" || float < 0) throw new TypeError("Wrong expression")
        if (!(currency instanceof Currency)) throw new TypeError("Currency constructor expected")

        const integer = Math.trunc(float)
        const nstring = `${float}`
        const nindex = nstring.indexOf(".")
        const decimal = Number.parseInt((nindex > -1 ? nstring.substring(nindex + 1) : "0"), 10)

        return new Money(integer, decimal, currency)
    }

    static change(a, b) {
        if (!(a instanceof Money
            && b instanceof Money)) throw new TypeError("Money constructor expected")
        if (!Currency.equal(a.currency, b.currency)) throw new Error("Different currencies are not supported")

        return Money.integer(a.number - b.number, a.currency)
    }

    static merge(a, b) {
        if (!(a instanceof Money
            && b instanceof Money)) throw new TypeError("Money constructor expected")
        if (!Currency.equal(a.currency, b.currency)) throw new Error("Different currencies are not supported")

        return Money.integer(a.number + b.number, a.currency)
    }
}
