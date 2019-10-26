import Account from "./Account"
import Money from "./Money"
import Currency from "./Currency"

export default class Client {
    _name = null

    _accounts = []

    constructor(name, accounts, mono = null) {
        if (typeof name !== "string") throw TypeError("Incorrect name")

        this._name = name
        this._accounts = accounts.map(e => new Account({
            id: e.id,
            balance: Money.integer(e.balance, Currency.number(e.currencyCode)),
            creditLimit: Money.integer(e.creditLimit, Currency.number(e.currencyCode)),
            cashbackType: e.cashbackType,
        }, mono))
    }

    get name() {
        return this._name
    }

    get accounts() {
        return this._accounts
    }
}
