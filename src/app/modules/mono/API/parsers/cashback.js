import Currency from "../classes/Currency"
import MoneyCashback from "../classes/cashbacks/MoneyCashback"
import MilesCashback from "../classes/cashbacks/MilesCashback"
import NoCashback from "../classes/cashbacks/NoCashback"
import Cashback from "../classes/Cashback"

export default function cashback(amount, type) {
    try {
        const currency = Currency.code(type)
        return new MoneyCashback(amount, currency)
    } catch (e) {
        // Not a currency
    }

    if (type === "Miles") return new MilesCashback(amount)
    if (type === "None") return new NoCashback()
    return new Cashback(amount, type)
}
