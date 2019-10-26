import cc from "currency-codes"

export default class Currency {
    constructor({
        code, number, digits, currency,
    }) {
        if (!(typeof code === "string")) throw new TypeError("Incorrect currency code")
        if (!Number.isInteger(number) || number < 0) throw new TypeError("Incorrect number")
        if (!Number.isInteger(digits) || digits < 0) throw new TypeError("Incorrect digits amount")
        if (!(typeof currency === "string")) throw new TypeError("Incorrect currency name")

        code = String(code).toUpperCase()

        Object.defineProperties(this,
            {
                code: {
                    value: code,
                    writable: false,
                    configurable: true,
                },
                number: {
                    value: number,
                    writable: false,
                    configurable: true,
                },
                digits: {
                    value: digits,
                    writable: false,
                    configurable: true,
                },
                currency: {
                    value: currency,
                    writable: false,
                    configurable: true,
                },
            })
    }

    static code(expression) {
        const info = cc.code(String(expression))
        if (!info) throw new Error("Unknown currency")

        return new Currency({
            code: info.code,
            number: Number.parseInt(info.number, 10),
            digits: info.digits,
            currency: info.currency,
        })
    }

    static number(expression) {
        const info = cc.number(String(expression))
        if (!info) throw new Error("Unknown currency")

        return new Currency({
            code: info.code,
            number: Number.parseInt(info.number, 10),
            digits: info.digits,
            currency: info.currency,
        })
    }

    static equal(a, b) {
        if (!(a instanceof Currency
            && b instanceof Currency)) throw new TypeError("Currency constructor expected")

        return a.number === b.number
    }
}
