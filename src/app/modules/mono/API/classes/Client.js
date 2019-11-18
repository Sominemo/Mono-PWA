import Account from "./Account"
import Money from "./Money"
import Currency from "./Currency"

export default class Client {
    name = null

    accounts = []

    constructor(name, accounts, mono = null, raw = {}) {
        if (typeof name !== "string") throw TypeError("Incorrect name")

        this.name = name
        this.accounts = accounts.map(e => new Account({
            id: e.id,
            balance: Money.integer(Math.abs(e.balance), Currency.number(e.currencyCode)),
            isOverdraft: (e.balance < 0),
            creditLimit: Money.integer(e.creditLimit, Currency.number(e.currencyCode)),
            cashbackType: e.cashbackType,
        }, mono))

        this.api = mono
        this.raw = raw
    }
}
