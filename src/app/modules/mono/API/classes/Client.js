import delayAction from "@Core/Tools/objects/delayAction"
import PWA from "@App/modules/main/PWA"
import Account from "./Account"
import Money from "./Money"
import Currency from "./Currency"

export default class Client {
    name = null

    accounts = []

    constructor(name, accounts, mono = null, raw = {}, online = true) {
        if (typeof name !== "string") throw TypeError("Incorrect name")

        this.name = name
        this.accounts = accounts.map(e => new Account({
            id: e.id,
            balance: Money.integer(Math.abs(e.balance), Currency.number(e.currencyCode)),
            isOverdraft: (e.balance < 0),
            creditLimit: Money.integer(e.creditLimit, Currency.number(e.currencyCode)),
            cashbackType: e.cashbackType,
        }, mono))

        if (online && PWA.analyticsAllowed) {
            delayAction(() => {
                const hasCur = this.accounts.some(
                    c => (c.balance.currency.number !== 980 && c.balance.number > 0),
                )

                window.gtag("set", { user_properties: { has_foreign_currency: hasCur } })
            })
        }

        this.api = mono
        this.raw = raw
    }
}
