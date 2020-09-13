import Statement from "./Statement"
import Money from "./Money"
import StatementStorage from "../../services/StatementStorage"
import BankCard from "./BankCard"
import DetectPaymentSystem from "./cardTypes/DetectPaymentSystem"

export default class Account {
    constructor({
        id, balance, creditLimit, cashbackType, isOverdraft, cards: { masks, type }, iban,
    }, mono = null) {
        if (typeof id !== "string") throw new TypeError("Incorrect ID")
        if (!(balance instanceof Money)) throw new TypeError("Money constructor expected")
        if (!(creditLimit instanceof Money)) throw new TypeError("Money constructor expected")
        if (typeof cashbackType !== "string") throw new TypeError("Incorrect cashback type")
        if (typeof isOverdraft !== "boolean") throw new TypeError("Incorrect isOverdraft type")
        if (!Array.isArray(masks)) throw new TypeError("Incorrect masks type")
        masks.forEach((mask) => {
            if (typeof mask !== "string") throw new TypeError("Incorrect mask type")
        })
        if (typeof type !== "string") throw new TypeError("Incorrect account type")

        const cards = masks.map((mask) => {
            const spl = mask.split("*")
            const num = { start: spl[0], end: spl[spl.length - 1] }

            const paymentSystem = DetectPaymentSystem(num)
            const level = null
            const color = null

            return new BankCard(this, num, paymentSystem, type, level, { color })
        })

        Object.defineProperties(this, {
            id: {
                value: id,
                writable: false,
                configurable: true,
            },
            iban: {
                value: iban,
                writable: false,
                configurable: true,
            },
            accountBalance: {
                value: balance,
                writable: false,
                configurable: true,
            },
            balance: {
                get() {
                    if (!Account.hideCreditLimit) return balance

                    return Money.change(
                        Money.max(balance, creditLimit),
                        Money.min(balance, creditLimit),
                    )
                },
            },
            isAccountOverdraft: {
                value: isOverdraft,
                writable: false,
                configurable: true,
            },
            isOverdraft: {
                get() {
                    if (!Account.hideCreditLimit) return isOverdraft
                    return Object.is(Money.min(creditLimit, balance), balance)
                },
            },
            creditLimit: {
                value: creditLimit,
                writable: false,
                configurable: true,
            },
            cashbackType: {
                value: cashbackType,
                writable: false,
                configurable: true,
            },
            client: {
                value: mono,
                writable: false,
                configurable: true,
            },
            cards: {
                value: cards,
                writable: false,
                configurable: true,
            },
            statement: {
                async value(from, to = new Date()) {
                    if (!mono || !mono.authed) throw new Error("No access to mono")
                    if (!(from instanceof Date && to instanceof Date)) throw new TypeError("Date constructor expected")

                    const fromTime = Math.floor(from.getTime() / 1000)
                    const toTime = Math.floor(to.getTime() / 1000)

                    let statementRAW

                    try {
                        statementRAW = await mono.call(
                            `personal/statement/${this.id}/${fromTime}/${toTime}`,
                            {
                                methodID: "personal/statement",
                                useAuth: true,
                            },
                        )
                        StatementStorage.addItems(this.id, statementRAW)
                    } catch {
                        statementRAW = await StatementStorage.get(this.id, fromTime, toTime)
                    }

                    return new Statement(this, statementRAW, from, to)
                },
                writable: false,
                configurable: true,
            },
        })
    }

    static hideCreditLimit = false
}
