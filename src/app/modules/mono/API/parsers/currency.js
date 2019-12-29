import CurrencyInfo from "../classes/CurrencyInfo"
import { Currency } from "../classes/Currency"

export default function parseCurrencyRAW(raw) {
    return raw.map((data) => new CurrencyInfo({
        currencyA: Currency.number(data.currencyCodeA),
        currencyB: Currency.number(data.currencyCodeB),
        date: new Date(data.date * 1000),
        ...("rateCross" in data
            ? {
                rateSell: data.rateCross,
                rateBuy: true,
            }
            : {
                rateSell: data.rateSell,
                rateBuy: data.rateBuy,
            }),
    }))
}
