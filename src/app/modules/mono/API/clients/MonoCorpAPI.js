import { API } from "@App/tools/API"
import OfflineCache from "../../services/OfflineCache"
import parseCurrencyRAW from "../parsers/currency"
import Client from "../classes/Client"

export default class MonoCorpAPI extends API {
    constructor(token, domain) {
        if (typeof token !== "string") throw new TypeError("String token expected")
        if (typeof domain !== "string") throw new TypeError("String domain expected")
        super({
            domain,
            requestTimeouts: {
                "bank/currency": 60000,
                "personal/client-info": 0,
                "personal/statement": 0,
                "personal/auth/request": 0,
            },
            globalTimeout: 0,
            token,
        })
    }

    authed = true

    async currency(burst = false) {
        const currenciesRAW = await this.call("bank/currency", {
            methodID: "bank/currency",
            settings: (burst ? API.flags.skip | API.flags.resendOnFlood
                : API.flags.resendOnFlood),
        })


        OfflineCache.saveCurrencies(currenciesRAW)

        return parseCurrencyRAW(currenciesRAW)
    }

    async clientInfo(token = null) {
        const data = await this.call("personal/client-info", {
            methodID: "personal/client-info",
            useAuth: true,
            customToken: token,
        })
        if (!("name" in data && "accounts" in data)) throw Error("Incorrect Client Info")
        return new Client(data.name, data.accounts, this)
    }

    _authAttacher(object, request) {
        object.headers["X-Request-Id"] = (request.customToken ? request.customToken : this.token)
        return object
    }
}
