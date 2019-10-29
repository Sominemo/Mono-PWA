import OfflineCache from "@App/modules/mono/services/OfflineCache"
import parseCurrencyRAW from "../../parsers/currency"

export default async function currency(burst = false) {
    const currenciesRAW = await this.call("bank/currency", {
        methodID: "bank/currency",
        settings: (burst ? this.constructor.flags.skip | this.constructor.flags.resendOnFlood
            : this.constructor.flags.resendOnFlood),
    })


    OfflineCache.saveCurrencies(currenciesRAW)

    return parseCurrencyRAW(currenciesRAW)
}
