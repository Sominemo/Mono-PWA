import cc from "currency-codes"

class Currency {
    constructor({
        code, number, digits, currency, countries,
    }) {
        if (!(typeof code === "string")) throw new TypeError("Incorrect currency code")
        if (!Number.isInteger(number) || number < 0) throw new TypeError("Incorrect number")
        if (!Number.isInteger(digits) || digits < 0) throw new TypeError("Incorrect digits amount")
        if (!(typeof currency === "string")) throw new TypeError("Incorrect currency name")
        if (!Array.isArray(countries) || countries.some((e) => typeof e !== "string")) throw new TypeError("Incorrect countries")

        code = String(code).toUpperCase()

        this.code = code
        this.number = number
        this.digits = digits
        this.currency = currency
        this.countries = countries
    }

    static code(expression) {
        const info = cc.code(String(expression))
        if (!info) {
            // throw new Error("Unknown currency")

            // eslint-disable-next-line no-use-before-define
            return new UnknownCurrency(expression)
        }

        return new Currency({
            code: info.code,
            number: Number.parseInt(info.number, 10),
            digits: info.digits,
            currency: info.currency,
            countries: info.countries,
        })
    }

    static number(expression) {
        const expr = String(expression).padStart(3, "0")
        const info = cc.number(expr)
        if (!info) {
            // throw new Error("Unknown currency")

            // eslint-disable-next-line no-use-before-define
            return new UnknownCurrency(expr)
        }

        return new Currency({
            code: info.code,
            number: Number.parseInt(info.number, 10),
            digits: info.digits,
            currency: info.currency,
            countries: info.countries,
        })
    }

    static equal(a, b) {
        if (!(a instanceof Currency
            && b instanceof Currency)) throw new TypeError("Currency constructor expected")

        return a.number === b.number
    }
}

class UnknownCurrency extends Currency {
    constructor(expr) {
        super({
            code: expr,
            number: 0,
            digits: 2,
            currency: `#${expr}`,
            countries: [],
        })
    }
}

export {
    Currency,
    UnknownCurrency,
}
