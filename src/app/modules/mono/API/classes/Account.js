import Statement from "./Statement"
import Money from "./Money"

export default function Account({
    id, balance, creditLimit, cashbackType,
}, mono = null) {
    if (typeof id !== "string") throw new TypeError("Incorrect ID")
    if (!(balance instanceof Money)) throw new TypeError("Money constructor expected")
    if (!(creditLimit instanceof Money)) throw new TypeError("Money constructor expected")
    if (typeof cashbackType !== "string") throw new TypeError("Incorrect cashback type")

    Object.defineProperties(this, {
        id: {
            value: id,
            writable: false,
            configurable: true,
        },
        balance: {
            value: balance,
            writable: false,
            configurable: true,
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
        statement: {
            async value(from, to = new Date()) {
                if (!mono || !mono.authed) throw new Error("No access to Mono")
                if (!(from instanceof Date && to instanceof Date)) throw new TypeError("Date constructor expected")

                const fromTime = Math.floor(from.getTime() / 1000)
                const toTime = Math.floor(to.getTime() / 1000)

                const statementRAW = await mono.call(
                    `personal/statement/${this.id}/${fromTime}/${toTime}`,
                    {
                        methodID: "personal/statement",
                        useAuth: true,
                    },
                )

                return new Statement(this, statementRAW, from, to)
            },
            writable: false,
            configurable: true,
        },
    })
}
