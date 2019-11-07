import Money from "@App/modules/mono/API/classes/Money"

export default function printMoney(money, isfull = false) {
    if (!(money instanceof Money)) throw new Error("Wrong Money object")

    let char = money.currency.code

    if (money.currency.number === 980) char = "₴"
    if (money.currency.number === 840) char = "$"
    if (money.currency.number === 978) char = "€"
    if (money.currency.number === 985) char = "zł"

    return `${money.integer}${(isfull ? `.${money.decimal}` : "")} ${char}`
}
