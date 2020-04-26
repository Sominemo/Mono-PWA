import { Report } from "@Core/Services/Report"
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
                Report.add([JSON.parse(JSON.stringify(item)), e], ["statement.constructorFailure"])
            }
        })
    }

    * [Symbol.iterator]() {
        yield* this.list
    }
}
