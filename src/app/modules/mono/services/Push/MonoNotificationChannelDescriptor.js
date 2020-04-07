import NotificationChannelDescriptor from "@Core/Services/Push/NotificationChannelDescriptor"
import { $ } from "@Core/Services/Language/handler"
import ucFirst from "@Core/Tools/transformation/text/ucFirst"
import StatementStorage from "../StatementStorage"

export default class MonoNotificationChannelDescriptor extends NotificationChannelDescriptor {
    static async templateWorker({ mode, value }) {
        if (mode === "statement") {
            const accounts = await StatementStorage.getAccountList(true, true)
            const cur = accounts.find((account) => account.id === value)
            if (!cur) return `${$("push/i/statement/unknown_account")} ${value}`

            return `${cur.cards.map((card) => `**${card.mask.end}`).join(", ")} ${cur.balance.currency.code} ${ucFirst(cur.cards[0].type)}`
        }
        return super.templateWorker({ mode, value })
    }
}
