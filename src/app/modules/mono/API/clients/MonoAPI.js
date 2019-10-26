import { API } from "@App/tools/API"
import OfflineCache from "../../services/OfflineCache"
import parseCurrencyRAW from "../parsers/currency"

export default class MonoAPI extends API {
    constructor(token = null) {
        super({
            domain: "https://api.monobank.ua",
            requestTimeouts: {
                "bank/currency": 60000,
                "personal/client-info": 60000,
                "personal/statement": 60000,
            },
            globalTimeout: 0,
            token,
        })
    }

    get authed() {
        return typeof this.token === "string" && this.token.length > 0
    }

    async currency(burst = false) {
        const currenciesRAW = await this.call("bank/currency", {
            methodID: "bank/currency",
            settings: (burst ? API.flags.skip | API.flags.resendOnFlood
                : API.flags.resendOnFlood),
        })


        OfflineCache.saveCurrencies(currenciesRAW)

        return parseCurrencyRAW(currenciesRAW)
    }

    clientInfo(burst = false, token = null) {
        return this.call("personal/client-info", {
            methodID: "personal/client-info",
            useAuth: true,
            customToken: token,
            settings: (burst ? API.flags.skip | API.flags.resendOnFlood
                : API.flags.resendOnFlood),
        })
    }
}
