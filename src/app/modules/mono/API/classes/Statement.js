import Report from "@Core/Services/report"
import StatementItem from "./StatementItem"

export default class Statement {
    list = []

    constructor(account, list, from, to) {
        if (!(from instanceof Date && to instanceof Date)) throw new TypeError("Date in from and to expected")
        if (from.getTime() > to.getTime()) throw new Error("From can't be later than to")

        list.forEach((item) => {
            try {
                this.list.push(
                    new StatementItem(item, account),
                )
            } catch (e) {
                Report.error("Failed to construct StatementItem", JSON.parse(JSON.stringify(item)))
            }
        })
    }

    * [Symbol.iterator]() {
        yield* this.list
    }
}
