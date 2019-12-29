import MCC from "./MCC"
import Money from "./Money"
import { Currency } from "./Currency"
import cashback from "../parsers/cashback"

export default class StatementItem {
    constructor({
        id,
        time,
        description,
        mcc,
        amount,
        operationAmount,
        currencyCode,
        commissionRate,
        cashbackAmount,
        balance,
    }, account) {
        if (typeof id !== "string") throw new TypeError("Incorrect ID")
        time = new Date(time * 1000)
        if (typeof description !== "string") throw new TypeError("Incorrect description")
        mcc = new MCC(mcc)
        const out = !!(amount < 0)
        amount = Money.integer(Math.abs(amount), account.balance.currency)
        operationAmount = Money.integer(Math.abs(operationAmount), Currency.number(currencyCode))
        commissionRate = Money.integer(Math.abs(commissionRate), Currency.number(currencyCode))
        if (Number.isNaN(cashbackAmount)) throw new TypeError("Incorrect Cashback Amount")
        balance = Money.integer(Math.abs(balance), account.balance.currency)

        this.id = id
        this.time = time
        this.out = out
        this.description = description
        this.mcc = mcc
        this.amount = amount
        this.operationAmount = operationAmount
        this.commissionRate = commissionRate
        this.cashback = cashback(cashbackAmount, account.cashbackType)
        this.balance = balance
        this.balanceOverdraft = (balance < 0)
    }
}
