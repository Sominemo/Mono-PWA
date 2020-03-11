import Money from "@App/modules/mono/API/classes/Money"
import MoneyPrintConfig from "./MoneyPrintConfig"

export default function printMoney(money, isfull = null, noCur = false) {
    if (!(money instanceof Money)) throw new Error("Wrong Money object")

    if (isfull === null) isfull = MoneyPrintConfig.showMinorPart

    let char = money.currency.code

    if (money.currency.number === 980) char = "₴"
    if (money.currency.number === 840) char = "$"
    if (money.currency.number === 978) char = "€"
    if (money.currency.number === 985) char = "zł"

    return `${isfull || money.number < (10 ** money.currency.digits) ? money.string : money.integer}${(noCur ? "" : ` ${char}`)}`
}
