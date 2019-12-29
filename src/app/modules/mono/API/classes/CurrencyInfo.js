import { Currency } from "./Currency"
import Money from "./Money"

export default class CurrencyInfo {
    constructor({
        currencyA, currencyB, date, rateSell, rateBuy = true,
    }) {
        if (!(currencyA instanceof Currency
            && currencyB instanceof Currency)) throw new TypeError("Currency constructor expected")
        if (Currency.equal(currencyA, currencyB)) throw new TypeError("Currencies can't be the same")
        if (!(date instanceof Date)) throw new TypeError("Date constructor expected")
        if (typeof rateSell !== "number") throw new TypeError("Float expected")
        if (typeof rateBuy !== "number" && rateBuy !== true) throw new TypeError("Float or true expected")

        Object.defineProperties(this,
            {
                currencyA: {
                    value: currencyA,
                    writable: false,
                    configurable: true,
                },
                currencyB: {
                    value: currencyB,
                    writable: false,
                    configurable: true,
                },
                date: {
                    value: date,
                    writable: false,
                    configurable: true,
                },
                rateSell: {
                    value: rateSell,
                    writable: false,
                    configurable: true,
                },
                rateBuy: {
                    value: (rateBuy === true ? rateSell : rateBuy),
                    writable: false,
                    configurable: true,
                },
                cross: {
                    value: rateBuy === true,
                    writable: false,
                    configurable: true,
                },
            })
    }

    exchange(amount) {
        if (!(amount instanceof Money)) throw new TypeError("Money constructor expected")
        if (!Currency.equal(amount.currency, this.currencyA)
        && !Currency.equal(amount.currency, this.currencyB)) throw new TypeError("This currency is not supported by this constructor")

        if (Currency.equal(amount.currency, this.currencyA)) {
            return Money.integer(Math.round(amount.number * this.rateSell), this.currencyB)
        }

        return Money.integer(Math.round(amount.number / this.rateBuy), this.currencyA)
    }
}
